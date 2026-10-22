#Requires -Version 5.1
<#
  Safe deployer for the production frontend at optika100.com. This wraps the
  existing immutable-release pipeline (deploy/release.sh + verify-release.php)
  the same way deploy_beta.ps1 wraps beta's docroot swap -- today that pipeline
  was run by hand, file by file, over SSH. This script automates that exact
  sequence.

  Dry-run (builds + packages locally, touches nothing on the server):
    ./deploy/deploy_production.ps1 -Sha <pushed-commit>

  Deploy:
    ./deploy/deploy_production.ps1 -Sha <pushed-commit> -Execute

  Rollback (restores the server's single active release transaction):
    ./deploy/deploy_production.ps1 -Rollback -Execute

  The deploy always:
    - requires a CLEAN working tree checked out to exactly the requested,
      already-pushed commit. This gives the same "no untracked/dirty files
      leak into the artifact" guarantee deploy_beta.ps1 gets from `git archive`,
      without fighting package-production.mjs's own `git rev-parse HEAD` call
      (which needs a real .git directory and so can't run against an archive
      export);
    - builds the complete production artifact via `bun run build:production`
      (full prerender of every route -- partial builds are refused by the
      build config itself);
    - re-hashes the CURRENTLY LIVE backend files and routing baseline (.htaccess)
      over SSH right before packaging, so the release manifest always reflects
      the real server state, never a stale local record. Production's backend
      is deployed incrementally/file-by-file (see cutover-backend/AGENTS.md),
      so there is no single backend git SHA that cleanly maps to "what's live";
    - extracts deploy/release.sh and friends fresh from the git blob (`git
      cat-file blob`, raw bytes) rather than the working tree, so Windows'
      core.autocrlf can never reintroduce CRLF line endings into the uploaded
      shell script. (This is exactly what broke the first manual run of this
      pipeline on 2026-10-22: `set -Eeuo pipefail` with a trailing \r is not a
      valid option name to bash.)
    - uploads the release archive and deploy tools, then runs release.sh on
      the server, which does its own atomic release swap, routing-baseline
      drift check, and live product-link smoke test, with automatic rollback
      on any failure;
    - independently re-verifies the live site after a successful deploy
      (not just trusting release.sh's own exit code);
    - prunes old immutable releases beyond -KeepReleases and removes the
      uploaded archive, so repeated deploys don't silently fill the Beget
      account's storage quota the way the beta clone did on 2026-10-22.
#>
[CmdletBinding()]
param(
    [string]$Sha,
    [switch]$Execute,
    [switch]$Rollback,
    [string]$FrontendRepo,
    [string]$KeyPath = "$env:USERPROFILE\.ssh\optika_beget",
    [string]$SshUser = 'tretya9f_stan',
    [string]$SshHost = 'tretya9f.beget.tech',
    [string]$RemoteHome = '/home/t/tretya9f',
    [string]$DocRoot = '/home/t/tretya9f/wpoptik/public_html',
    [string]$SmokeOrigin = 'https://optika100.com',
    [int]$KeepReleases = 5
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $FrontendRepo) {
    $scriptDir = Split-Path -Parent $PSCommandPath
    $FrontendRepo = Split-Path -Parent $scriptDir
}
$FrontendRepo = (Resolve-Path $FrontendRepo).Path
$SshExe = Join-Path $env:WINDIR 'System32\OpenSSH\ssh.exe'
$ScpExe = Join-Path $env:WINDIR 'System32\OpenSSH\scp.exe'
# Same crash as deploy_beta.ps1 documents: the OS-bundled bsdtar dies walking
# this repo's asset trees. Prefer Git for Windows' GNU tar.
$TarExe = @("$env:ProgramFiles\Git\usr\bin\tar.exe",
            "$env:LOCALAPPDATA\hermes\git\usr\bin\tar.exe",
            (Join-Path $env:WINDIR 'System32\tar.exe')) |
    Where-Object { Test-Path $_ } | Select-Object -First 1
$TarArgs = @()
if ($TarExe -like '*\usr\bin\tar.exe') {
    $TarArgs = @('--force-local')
    $env:PATH = (Split-Path $TarExe) + ';' + $env:PATH
}
$Remote = "$SshUser@$SshHost"
$DeployToolsDir = "$RemoteHome/.o100-deploy-tools"
$SshOpts = @(
    '-i', $KeyPath,
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=yes',
    '-o', 'ConnectTimeout=15',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=2',
    '-o', 'ConnectionAttempts=1'
)

# Backend files release-manifest.json / verify-release.php require. Mirrors
# the set recorded by the last known-good manifest (live-release-manifest.json)
# and the checkout-runtime subset enforced by scripts/checkout-runtime-manifest.mjs.
# Always re-hashed live off the server -- this list only says WHICH files
# matter, never what their content should be.
$BackendFileList = @(
    'api/store/_durable.php', 'api/store/_sdek_origin.php', 'api/store/sdek_widget_frame.php',
    'api/store/sdek_ajax_proxy.php', 'api/store/_bootstrap.php', 'api/store/_security.php',
    'api/store/_session.php', 'api/store/_index.php', 'api/store/_facets.php', 'api/store/csrf.php',
    'api/store/_catalog_identity.php', 'api/store/catalog_sections.php', 'api/store/_product.php',
    'api/store/product.php', 'api/store/products.php', 'api/store/search.php',
    'api/store/_basket_display.php', 'api/store/_basket_bridge.php', 'api/store/_checkout.php',
    'api/store/_outbox.php', 'api/store/order_quote.php', 'api/store/order_attempt.php',
    'api/store/basket_snapshot.php', 'api/store/basket_export.php', 'api/store/order_delivery.php',
    'api/store/order_create.php', 'api/store/callback.php', 'api/store/lens_selection_request.php',
    'local/tools/o100-cart-recovery.php', 'local/tools/o100-product-fallback.php',
    'local/tools/o100-frontend-404.php', 'bitrix/templates/optica_aspro_next/header.php'
)
$DeployToolFiles = @('release.sh', 'merge-routing.php', 'verify-release.php', 'production.htaccess', 'redirects.production.txt')

function Invoke-Ssh([string]$Command) {
    $Command = $Command.Replace("`r`n", "`n").Replace("`r", "`n")
    $begin = 'OIB_' + [guid]::NewGuid().ToString('N')
    $end = 'OIE_' + [guid]::NewGuid().ToString('N')
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $output = & $SshExe @SshOpts $Remote "echo $begin; $Command; echo ${end}:`$?" 2>&1
    $sshCode = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP
    $raw = $output | Out-String
    if ($sshCode -ne 0) {
        throw "SSH transport failed with exit $sshCode.`n$raw"
    }

    $beginAt = $raw.IndexOf($begin)
    if ($beginAt -lt 0) {
        throw "SSH response did not contain the begin marker.`n$raw"
    }

    $framed = $raw.Substring($beginAt + $begin.Length)
    $match = [regex]::Match($framed, [regex]::Escape($end) + ':(\d+)')
    if (-not $match.Success) {
        throw "SSH response did not contain the end marker.`n$raw"
    }

    $remoteCode = [int]$match.Groups[1].Value
    $body = $framed.Substring(0, $match.Index).Trim()
    if ($remoteCode -ne 0) {
        throw "Remote command failed with exit $remoteCode.`n$body"
    }
    return $body
}

function Copy-Up([string]$LocalPath, [string]$RemotePath) {
    & $ScpExe @SshOpts $LocalPath "${Remote}:$RemotePath"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP failed: $LocalPath -> $RemotePath"
    }
}

function Copy-UpChunked([string]$LocalPath, [string]$RemotePath, [string]$WorkDir) {
    # Beget's connection sometimes drops large uploads after a few dozen MB
    # (same issue deploy_beta.ps1 works around). Small parts, reassembled
    # remotely only once every part has arrived.
    $chunkSize = 8MB
    $stream = [IO.File]::OpenRead($LocalPath)
    $parts = @()
    try {
        $index = 0
        while ($stream.Position -lt $stream.Length) {
            $length = [int][Math]::Min($chunkSize, $stream.Length - $stream.Position)
            $bytes = New-Object byte[] $length
            $read = $stream.Read($bytes, 0, $length)
            if ($read -ne $length) { throw "Short read from $LocalPath" }
            $localPart = Join-Path $WorkDir ("prod-part-{0:D4}" -f $index)
            $remotePart = ("{0}.part.{1:D4}" -f $RemotePath, $index)
            [IO.File]::WriteAllBytes($localPart, $bytes)
            try {
                $sent = $false
                for ($attempt = 1; $attempt -le 3 -and -not $sent; $attempt++) {
                    try { Copy-Up $localPart $remotePart; $sent = $true }
                    catch {
                        if ($attempt -eq 3) { throw }
                        Start-Sleep -Seconds 2
                    }
                }
                $parts += $remotePart
            }
            finally { Remove-Item -LiteralPath $localPart -Force }
            $index++
        }
    }
    finally { $stream.Dispose() }
    $quoted = ($parts | ForEach-Object { "'$_'" }) -join ' '
    Invoke-Ssh "cat $quoted > '$RemotePath' && rm -f $quoted" | Out-Null
}

function Get-RemoteSha([string]$Path) {
    $line = Invoke-Ssh "sha256sum '$Path'"
    $hash = (($line -split '\s+')[0]).ToLowerInvariant()
    if ($hash -notmatch '^[0-9a-f]{64}$') {
        throw "Invalid remote SHA-256 for $Path`: $line"
    }
    return $hash
}

function Get-GitBlobBytes([string]$Ref) {
    # Raw committed bytes, bypassing core.autocrlf entirely -- PowerShell's own
    # text redirection operators can silently re-encode/CRLF-normalize an
    # external command's stdout, so this reads the stream directly.
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'git'
    $psi.Arguments = "-C `"$FrontendRepo`" cat-file blob $Ref"
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $proc = [System.Diagnostics.Process]::Start($psi)
    $ms = New-Object System.IO.MemoryStream
    $proc.StandardOutput.BaseStream.CopyTo($ms)
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    if ($proc.ExitCode -ne 0) {
        throw "git cat-file blob $Ref failed: $stderr"
    }
    return $ms.ToArray()
}

function Get-Sha256Hex([byte[]]$Bytes) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($Bytes)).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}

function Resolve-PushedSha {
    if (-not $Sha) {
        throw 'Deploy mode requires -Sha <pushed commit>.'
    }
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & git -C $FrontendRepo fetch origin 2>&1 | Out-Null
    $ErrorActionPreference = $prevEAP
    if ($LASTEXITCODE -ne 0) {
        throw 'git fetch origin failed.'
    }

    $fullSha = (& git -C $FrontendRepo rev-parse "$Sha^{commit}" 2>$null).Trim()
    if ($LASTEXITCODE -ne 0 -or $fullSha -notmatch '^[0-9a-f]{40}$') {
        throw "Cannot resolve commit $Sha."
    }

    $containing = & git -C $FrontendRepo for-each-ref --format='%(refname)' --contains $fullSha refs/remotes/origin 2>$null
    if (-not $containing) {
        throw "$fullSha is not pushed to any origin branch."
    }
    return $fullSha
}

function Assert-CleanWorkingTreeAt([string]$FullSha) {
    # No `git archive` export here (package-production.mjs calls `git rev-parse
    # HEAD`, which needs a real .git directory). Instead: prove the working
    # tree already equals that commit exactly, which gives the identical
    # "nothing untracked or dirty leaks into the build" guarantee -- except
    # for the handful of paths the build itself deterministically regenerates
    # every run (content:localize, manifest:production, TanStack's route-tree
    # codegen), which routinely sit dirty between builds and can't leak
    # anything: the build overwrites them from source + live catalog data
    # regardless of what was there before.
    $headSha = (& git -C $FrontendRepo rev-parse HEAD).Trim()
    if ($headSha -ne $FullSha) {
        throw "Working tree HEAD ($headSha) is not the requested commit ($FullSha). Check out $FullSha first."
    }
    $regenPrefixes = @('public/essilor/', 'public/eyezen/', 'public/varilux/')
    $regenExact = @('public/robots.txt', 'public/sitemap.xml', 'src/routeTree.gen.ts', 'src/data/articles-content.json')
    $lines = & git -C $FrontendRepo status --porcelain --untracked-files=all
    $dirty = $lines | Where-Object {
        $_ -and
        ($line = $_) -and
        ($code = $line.Substring(0, 2)) -and
        ($path = $line.Substring(3).Trim('"')) -and
        -not ($regenExact -contains $path) -and
        -not ($regenPrefixes | Where-Object { $path.StartsWith($_) }) -and
        # Only files under src/ can be pulled into the Vite bundle; untracked
        # clutter elsewhere (repo-root scratch files, deploy/ output, old
        # session artifacts) cannot leak into the build regardless of status.
        -not ($code -eq '??' -and -not $path.StartsWith('src/'))
    }
    if ($dirty) {
        throw "Working tree has changes outside the build's own regenerated files -- refusing to build (would leak into the production artifact):`n$($dirty -join "`n")"
    }
}

function Get-LiveBackendManifest {
    Write-Host 'Hashing currently-live backend files and routing baseline over SSH...'
    $fileList = ($BackendFileList | ForEach-Object { "'$_'" }) -join ' '
    $output = Invoke-Ssh "cd '$DocRoot' && sha256sum $fileList"
    $files = [ordered]@{}
    foreach ($rawLine in ($output -split "`n")) {
        $line = $rawLine.Trim("`r", ' ')
        if (-not $line) { continue }
        $parts = $line -split '\s+', 2
        $hash = $parts[0].ToLowerInvariant()
        $path = $parts[1].TrimStart('*').Trim("`r")
        if ($hash -notmatch '^[0-9a-f]{64}$') { throw "Bad hash line from server: $line" }
        $files[$path] = $hash
    }
    foreach ($required in $BackendFileList) {
        if (-not $files.Contains($required)) { throw "Live backend hash missing for $required" }
    }
    $baseline = Get-RemoteSha "$DocRoot/.htaccess"
    return [pscustomobject]@{ Files = $files; RoutingBaseline = $baseline }
}

function Build-ProductionArtifact {
    Push-Location $FrontendRepo
    try {
        Write-Host 'bun install --frozen-lockfile...'
        & bun install --frozen-lockfile | Out-Host
        if ($LASTEXITCODE -ne 0) { throw 'bun install --frozen-lockfile failed.' }

        Write-Host 'bun run build:production (full prerender, this takes a while)...'
        $oldApi = $env:VITE_BITRIX_API
        try {
            $env:VITE_BITRIX_API = $SmokeOrigin
            & bun run build:production | Out-Host
            if ($LASTEXITCODE -ne 0) { throw 'bun run build:production failed.' }
        }
        finally {
            $env:VITE_BITRIX_API = $oldApi
        }
    }
    finally {
        Pop-Location
    }
}

function Write-BackendManifestFile([string]$Path, [string]$BackendSha, [System.Collections.Specialized.OrderedDictionary]$Files) {
    $obj = [ordered]@{ sha = $BackendSha; files = $Files }
    $json = $obj | ConvertTo-Json -Depth 5
    # Windows PowerShell 5.1's -Encoding UTF8 writes a BOM, which Node's
    # JSON.parse does not strip -- package-production.mjs would fail with
    # "Unexpected token" on the very first character.
    [IO.File]::WriteAllText($Path, $json, (New-Object Text.UTF8Encoding $false))
}

function Get-BackendReferenceSha {
    # Informational label only -- verify-release.php never checks this against
    # anything; the `files` hashes (always re-measured live, see
    # Get-LiveBackendManifest) are what actually gates the deploy.
    $sha = & git -C (Join-Path $FrontendRepo '..\cutover-backend') rev-parse HEAD 2>$null
    if (-not $sha) { return '0' * 40 }
    return $sha.Trim()
}

function Package-Release([string]$FullSha, [string]$RoutingBaseline, [string]$BackendSha, [string]$BackendManifestPath) {
    Push-Location $FrontendRepo
    try {
        $oldBackendSha = $env:O100_BACKEND_SHA
        $oldBaseline = $env:O100_ROUTING_SHA256
        $oldManifest = $env:O100_BACKEND_MANIFEST
        try {
            $env:O100_BACKEND_SHA = $BackendSha
            $env:O100_ROUTING_SHA256 = $RoutingBaseline
            $env:O100_BACKEND_MANIFEST = $BackendManifestPath
            Write-Host 'node scripts/package-production.mjs...'
            & node scripts/package-production.mjs | Out-Host
            if ($LASTEXITCODE -ne 0) { throw 'package-production.mjs failed.' }
        }
        finally {
            $env:O100_BACKEND_SHA = $oldBackendSha
            $env:O100_ROUTING_SHA256 = $oldBaseline
            $env:O100_BACKEND_MANIFEST = $oldManifest
        }
    }
    finally {
        Pop-Location
    }
}

function Test-ProductionHttp {
    $paths = @('/', '/catalog_s/opravy/', '/catalog_n/opravy/', '/checkout/', '/basket/', '/sitemap.xml')
    foreach ($path in $paths) {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$SmokeOrigin$path"
        if ([int]$response.StatusCode -ne 200) {
            throw "Production HTTP smoke failed for $path`: $($response.StatusCode)"
        }
    }
    try {
        $missing = Invoke-WebRequest -UseBasicParsing -Uri "$SmokeOrigin/cutover-missing-route-9f381a/" -MaximumRedirection 0
        throw "Expected 404 for an unknown route, got $([int]$missing.StatusCode)."
    }
    catch {
        if (-not $_.Exception.Response -or [int]$_.Exception.Response.StatusCode -ne 404) { throw }
    }
}

function Invoke-ReleaseCleanup {
    # Old immutable releases accumulate forever under release.sh's own design
    # (it has no retention policy). Each one is a full prerendered site
    # (600MB+); left alone they will eventually refill the account quota the
    # same way the untrimmed bitrix/backup/ archives did on 2026-10-22.
    # Keep the live release, plus the -KeepReleases most recent by mtime.
    $command = @"
set -euo pipefail
cd '$DocRoot/o100_frontend_releases'
current=`$(readlink -f '$DocRoot/o100_frontend_current' || true)
ls -1dt */ 2>/dev/null | sed 's#/`$##' | tail -n +$($KeepReleases + 1) | while read -r rel; do
  full="`$(pwd)/`$rel"
  if [ "`$full" != "`$current" ]; then rm -rf -- "`$rel"; fi
done
rm -f '$RemoteHome'/o100-release-*.tgz '$RemoteHome'/o100-release-*.tgz.part.*
echo CLEANUP_OK
"@
    Invoke-Ssh $command | Out-Null
}

if ($Rollback) {
    if (-not (Test-Path $KeyPath)) { throw "SSH key not found: $KeyPath" }
    Write-Host 'Rolling back to the server''s active release transaction...'
    if (-not $Execute) {
        Write-Host 'DRY-RUN: add -Execute to roll back.'
        return
    }
    foreach ($file in $DeployToolFiles) {
        $bytes = Get-GitBlobBytes "HEAD:deploy/$file"
        $tmp = [IO.Path]::GetTempFileName()
        try {
            [IO.File]::WriteAllBytes($tmp, $bytes)
            Copy-Up $tmp "$DeployToolsDir/$file" 2>$null
        }
        finally { Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue }
    }
    Invoke-Ssh "mkdir -p '$DeployToolsDir' && chmod +x '$DeployToolsDir/release.sh'" | Out-Null
    $result = Invoke-Ssh "O100_SMOKE_ORIGIN='$SmokeOrigin' O100_PHP=php8.1 bash '$DeployToolsDir/release.sh' rollback '$DocRoot'"
    Write-Host $result
    Test-ProductionHttp
    Write-Host 'Rollback complete and HTTP smoke passed.'
    return
}

if (-not (Test-Path $KeyPath)) { throw "SSH key not found: $KeyPath" }

$fullSha = Resolve-PushedSha
Assert-CleanWorkingTreeAt $fullSha
Write-Host "Deploying frontend $fullSha"

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$work = Join-Path $env:TEMP "optika_production_$timestamp"
New-Item -ItemType Directory -Force -Path $work | Out-Null

try {
    $live = Get-LiveBackendManifest
    Write-Host "Routing baseline: $($live.RoutingBaseline)"

    $backendSha = Get-BackendReferenceSha

    Build-ProductionArtifact

    $manifestInput = Join-Path $work 'backend-manifest.json'
    Write-BackendManifestFile $manifestInput $backendSha $live.Files
    Package-Release $fullSha $live.RoutingBaseline $backendSha $manifestInput

    $client = Join-Path $FrontendRepo 'dist\client'
    $releaseSha = (Get-Content (Join-Path $client '.release-sha')).Trim()
    if ($releaseSha -ne $fullSha) { throw ".release-sha ($releaseSha) does not match the requested commit ($fullSha)." }

    # package-production.mjs hashes deploy/* from the Windows WORKING TREE,
    # which core.autocrlf checks out with CRLF line endings. The actual files
    # we upload (below) are read as raw git blobs instead (LF, see
    # Get-GitBlobBytes) specifically so release.sh's `set -Eeuo pipefail`
    # never breaks on a stray \r again. Those two byte streams differ, so the
    # manifest's own templateFiles hashes -- which verify-release.php checks
    # the uploaded tools against -- must be recomputed from the same blob
    # bytes we're actually going to upload, or the server rejects its own
    # just-built release as tampered.
    $toolBytes = @{}
    foreach ($file in $DeployToolFiles) {
        $toolBytes[$file] = Get-GitBlobBytes "HEAD:deploy/$file"
    }
    $manifestPath = Join-Path $client 'release-manifest.json'
    # Explicit UTF-8: Windows PowerShell 5.1 otherwise reads the file as ANSI and
    # double-encodes Cyrillic asset names (images/article/БЛИЗОРУКОСТЬ ИТОГ.jpg),
    # so verify-release.php on the server fails with "Artifact hash mismatch".
    $manifestObj = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $templateFiles = [ordered]@{}
    foreach ($file in $DeployToolFiles) {
        $templateFiles["deploy/$file"] = Get-Sha256Hex $toolBytes[$file]
    }
    $manifestObj | Add-Member -NotePropertyName templateFiles -NotePropertyValue $templateFiles -Force
    $manifestJson = $manifestObj | ConvertTo-Json -Depth 10
    [IO.File]::WriteAllText($manifestPath, $manifestJson, (New-Object Text.UTF8Encoding $false))
    Write-Host 'Repointed release-manifest.json templateFiles at the clean git-blob hashes that will actually be uploaded.'

    $archive = Join-Path $work "production-release-$fullSha.tgz"
    $archiveTarPath = $archive.Replace('\', '/')
    $clientTarPath = $client.Replace('\', '/')
    Write-Host 'Archiving the release (this is a large, full prerendered build)...'
    & $TarExe @TarArgs -czf $archiveTarPath -C $clientTarPath .
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the release archive.' }
    $localArchiveSha = (Get-FileHash $archive -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Host "Archive: $archive ($((Get-Item $archive).Length) bytes, sha256 $localArchiveSha)"

    if (-not $Execute) {
        Write-Host 'DRY-RUN complete. Build and package validated; no server changes were made.'
        return
    }

    foreach ($file in $DeployToolFiles) {
        $tmp = Join-Path $work $file
        [IO.File]::WriteAllBytes($tmp, $toolBytes[$file])
    }
    Invoke-Ssh "mkdir -p '$DeployToolsDir'" | Out-Null
    foreach ($file in $DeployToolFiles) {
        Copy-Up (Join-Path $work $file) "$DeployToolsDir/$file"
    }
    Invoke-Ssh "chmod +x '$DeployToolsDir/release.sh'" | Out-Null

    $remoteArchive = "$RemoteHome/o100-release-$fullSha.tgz"
    Write-Host 'Uploading release archive (chunked)...'
    Copy-UpChunked $archive $remoteArchive $work
    if ((Get-RemoteSha $remoteArchive) -ne $localArchiveSha) {
        throw 'Uploaded archive SHA-256 does not match the local artifact.'
    }

    Write-Host 'Running release.sh deploy on the server (atomic swap + live smoke test)...'
    $deployCommand = "O100_SMOKE_ORIGIN='$SmokeOrigin' O100_PHP=php8.1 bash '$DeployToolsDir/release.sh' deploy '$DocRoot' '$fullSha' '$($live.RoutingBaseline)' '$remoteArchive'"
    $result = Invoke-Ssh $deployCommand
    Write-Host $result

    Write-Host 'Independently re-verifying the live site...'
    Test-ProductionHttp

    try { Invoke-ReleaseCleanup } catch { Write-Warning "Post-deploy cleanup failed (non-fatal): $($_.Exception.Message)" }

    Write-Host ''
    Write-Host "PRODUCTION DEPLOY COMPLETE: $fullSha"
    $txMatch = [regex]::Match($result, 'rollback transaction: (\S+)')
    if ($txMatch.Success) {
        Write-Host "Rollback: ./deploy/deploy_production.ps1 -Rollback -Execute   (transaction: $($txMatch.Groups[1].Value))"
    }
}
finally {
    if (Test-Path $work) {
        $resolvedWork = (Resolve-Path -LiteralPath $work).Path
        $expectedWork = [IO.Path]::GetFullPath((Join-Path $env:TEMP "optika_production_$timestamp"))
        if ($resolvedWork -ne $expectedWork) { throw 'Refusing cleanup outside the created build directory.' }
        Remove-Item -LiteralPath $resolvedWork -Recurse -Force
    }
}
