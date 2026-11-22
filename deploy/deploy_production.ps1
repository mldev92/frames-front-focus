# Подготовка, публикация и откат проходят через контроллер в защищённой ветке main.
[CmdletBinding()]
param(
    [string]$Sha,
    [switch]$Execute,
    [switch]$Rollback,
    [string]$FrontendRepo = (Split-Path -Parent $PSScriptRoot),
    [ValidatePattern('^[0-9]+$')][string]$CandidateRunId,
    [ValidatePattern('^[0-9]+$')][string]$SnapshotRunId,
    [ValidatePattern('^[a-f0-9]{64}$')][string]$SnapshotSha256,
    [string]$KeyPath = "$env:USERPROFILE\.ssh\optika_beget",
    [string]$SshUser = 'tretya9f_stan',
    [string]$SshHost = 'tretya9f.beget.tech',
    [ValidatePattern('^/[a-zA-Z0-9_./-]+$')][string]$DocRoot = '/home/t/tretya9f/wpoptik/public_html'
)
$ErrorActionPreference = 'Stop'
if ([bool]$SnapshotRunId -ne [bool]$SnapshotSha256) { throw 'Supply both snapshot inputs.' }
if ($CandidateRunId -and (-not $Execute -or $SnapshotRunId -or $Rollback)) { throw 'Use -CandidateRunId with -Execute.' }
if ($Rollback -and $SnapshotRunId) { throw 'Snapshot inputs apply to preparation.' }
if ($Rollback -and -not $Execute) { Write-Output 'Dry run. Use -Rollback -Execute to dispatch rollback.'; return }
if ($Rollback -and -not $Sha) {
    $Sha = & ssh -T -o BatchMode=yes -o StrictHostKeyChecking=yes -i $KeyPath "$SshUser@$SshHost" "cat '$DocRoot/o100_frontend_current/.release-sha'"
    if ($LASTEXITCODE -ne 0) { throw 'Could not read published SHA.' }
}
if ($Sha) {
    if ($Sha -notmatch '^[a-fA-F0-9]{7,40}$') { throw 'Expected a commit SHA.' }
    $Sha = & git -C $FrontendRepo rev-parse --verify "$Sha^{commit}"
    if ($LASTEXITCODE -ne 0 -or $Sha -notmatch '^[a-f0-9]{40}$') { throw 'Unknown local commit.' }
} elseif (-not $CandidateRunId) { throw 'Supply -Sha or -CandidateRunId.' }
@{
    sha = $Sha
    candidateRun = $CandidateRunId
    snapshotRun = $SnapshotRunId
    snapshotDigest = $SnapshotSha256
    execute = [bool]$Execute
    rollback = [bool]$Rollback
} | ConvertTo-Json -Compress | & node (Join-Path $FrontendRepo 'scripts/code-only-workflow.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Release workflow failed.' }
