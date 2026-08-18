#!/usr/bin/env node

import { File } from "node:buffer";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { argv, cwd, env } from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const defaultReferenceDir = join(scriptDir, "photo-pipeline", "references");
const defaultTargets = {
  front: join(defaultReferenceDir, "target-front.jpg"),
  angle: join(defaultReferenceDir, "target-angle.jpg"),
};

const supportedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const restorationPrompt = [
  "Quality restoration mode: the source product image may be low-resolution, blurry, compressed, or poorly lit.",
  "Reconstruct a clean high-resolution catalog photo with crisp product edges, clearer lens contours, cleaner rim lines, reduced compression artifacts, smoother background, and balanced exposure.",
  "Restore visible materials faithfully: keep metal/plastic colors, transparency, reflections, nose pads, hinges, and temple tips consistent with Image 1.",
  "Do not invent new decorations, logos, readable markings, model numbers, colors, or parts that are not supported by Image 1. If small text is blurry or unreadable, leave it absent or softly indistinct rather than hallucinating text.",
  "The result should look like a professionally retouched product photo of the same frame, not a different model.",
].join("\n");

const poseSpecs = {
  front: {
    targetOption: "targetFront",
    prompt: [
      "Create a standardized ecommerce catalog product photo of the eyeglass frame from Image 1.",
      "Image 1 is the only source of product identity: preserve its frame shape, lens shape, bridge, rim thickness, colors, material finish, hinge style, temple colors, visible markings, proportions, and overall character.",
      "Image 2 is only a pose and composition reference. Match its straight-on front view, centered crop, opened temples receding behind the frame, camera height, white background, and catalog framing.",
      "Do not copy the product, brand, color, lens shape, text, or decorative details from Image 2.",
      "Open the temples naturally if they are folded or hidden in Image 1, but keep the design plausible for the same frame. If a tiny marking is not legible, omit it instead of inventing text.",
      "Use a clean pure-white studio background, even product lighting, sharp focus, no hands, no props, no watermark, no added labels, no text overlays, and no heavy shadow.",
      "Output exactly one finished catalog image.",
    ].join("\n"),
  },
  angle: {
    targetOption: "targetAngle",
    prompt: [
      "Create a standardized ecommerce catalog product photo of the eyeglass frame from Image 1.",
      "Image 1 is the only source of product identity: preserve its frame shape, lens shape, bridge, rim thickness, colors, material finish, hinge style, temple colors, visible markings, proportions, and overall character.",
      "Image 2 is only a pose and composition reference. Match its three-quarter angled product view, opened temples, camera perspective, white background, and wide catalog crop.",
      "Do not copy the product, brand, color, lens shape, text, or decorative details from Image 2.",
      "Open the temples naturally if they are folded or hidden in Image 1, but keep the design plausible for the same frame. If a tiny marking is not legible, omit it instead of inventing text.",
      "Use a clean pure-white studio background, even product lighting, sharp focus, no hands, no props, no watermark, no added labels, no text overlays, and no heavy shadow.",
      "Output exactly one finished catalog image.",
    ].join("\n"),
  },
};

function printHelp() {
  console.log(`
Usage:
  node scripts/frame-photo-pipeline.mjs --product <file-or-folder> [options]

Examples:
  node scripts/frame-photo-pipeline.mjs --product "C:\\Users\\stavo\\Downloads\\photo_pipeline_examp_1.jpg" --dry-run
  node scripts/frame-photo-pipeline.mjs --product "C:\\photos\\raw" --out-dir generated/frame-photo-pipeline --force
  node scripts/frame-photo-pipeline.mjs --product "C:\\photos\\soft.jpg" --restore-quality --size 2048x1024 --force

Options:
  --product <path>       Product image file, or a folder of jpg/png/webp files.
  --out-dir <path>       Output folder. Default: generated/frame-photo-pipeline
  --target-front <path>  Front pose reference. Default: scripts/photo-pipeline/references/target-front.jpg
  --target-angle <path>  Angled pose reference. Default: scripts/photo-pipeline/references/target-angle.jpg
  --only <pose>          Process only "front" or "angle". Default: both.
  --model <model>        OpenAI image model. Default: gpt-image-2
  --size <size>          Output size. Default: 1536x768
  --quality <quality>    low, medium, high, or auto. Default: high
  --format <format>      jpeg, png, or webp. Default: jpeg
  --input-fidelity <v>   high, low, or auto. Default: auto
  --restore-quality      Add prompt instructions for blurry/compressed/low-quality source photos.
  --retries <count>      Retry count for 429/5xx/API gateway failures. Default: 3
  --extra <text>         Extra instruction appended to both prompts.
  --force                Overwrite existing output files.
  --dry-run              Write prompt/manifest files only; do not call the API.
  --api-key-env <name>   Environment variable containing the API key. Default: OPENAI_API_KEY
  --help                 Show this help.

Environment:
  Set OPENAI_API_KEY before live runs. The script also reads .env.local and .env from this repo if present.
`);
}

function parseArgs(args) {
  const options = {
    product: null,
    outDir: resolve(cwd(), "generated", "frame-photo-pipeline"),
    targetFront: defaultTargets.front,
    targetAngle: defaultTargets.angle,
    only: null,
    model: "gpt-image-2",
    size: "1536x768",
    quality: "high",
    format: "jpeg",
    inputFidelity: "auto",
    restoreQuality: false,
    retries: 3,
    extra: "",
    force: false,
    dryRun: false,
    apiKeyEnv: "OPENAI_API_KEY",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const readValue = () => {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      index += 1;
      return value;
    };

    switch (arg) {
      case "--product":
        options.product = readValue();
        break;
      case "--out-dir":
        options.outDir = resolve(readValue());
        break;
      case "--target-front":
        options.targetFront = resolve(readValue());
        break;
      case "--target-angle":
        options.targetAngle = resolve(readValue());
        break;
      case "--only":
        options.only = readValue();
        break;
      case "--model":
        options.model = readValue();
        break;
      case "--size":
        options.size = readValue();
        break;
      case "--quality":
        options.quality = readValue();
        break;
      case "--format":
        options.format = readValue();
        break;
      case "--input-fidelity":
        options.inputFidelity = readValue();
        break;
      case "--restore-quality":
        options.restoreQuality = true;
        break;
      case "--retries":
        options.retries = Number.parseInt(readValue(), 10);
        break;
      case "--extra":
        options.extra = readValue();
        break;
      case "--api-key-env":
        options.apiKeyEnv = readValue();
        break;
      case "--force":
        options.force = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exitCode = 0;
        return null;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!options.product) {
    throw new Error("Missing required --product path.");
  }
  if (options.only && !["front", "angle"].includes(options.only)) {
    throw new Error('--only must be "front" or "angle".');
  }
  if (!["jpeg", "png", "webp"].includes(options.format)) {
    throw new Error('--format must be "jpeg", "png", or "webp".');
  }
  if (!["auto", "high", "low"].includes(options.inputFidelity)) {
    throw new Error('--input-fidelity must be "auto", "high", or "low".');
  }
  if (!Number.isInteger(options.retries) || options.retries < 0) {
    throw new Error("--retries must be a non-negative integer.");
  }

  options.product = resolve(options.product);
  return options;
}

function supportsInputFidelity(model) {
  return model !== "gpt-image-2" && model !== "gpt-image-2-2026-04-21";
}

async function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = await readFile(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    if (!key || env[key]) continue;
    let value = rawValue.join("=").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
}

function assertPathExists(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} does not exist: ${filePath}`);
  }
}

function imageMimeType(filePath) {
  const extension = extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  throw new Error(`Unsupported image type: ${filePath}`);
}

function outputExtension(format) {
  return format === "jpeg" ? "jpg" : format;
}

function slugFromPath(filePath) {
  return (
    basename(filePath, extname(filePath))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "frame"
  );
}

async function listProducts(productPath) {
  const productStat = await stat(productPath);
  if (productStat.isFile()) {
    if (!supportedImageExtensions.has(extname(productPath).toLowerCase())) {
      throw new Error(`Unsupported product image type: ${productPath}`);
    }
    return [productPath];
  }
  if (!productStat.isDirectory()) {
    throw new Error(`--product must be a file or folder: ${productPath}`);
  }

  const entries = await readdir(productPath);
  return entries
    .map((entry) => join(productPath, entry))
    .filter((entry) => supportedImageExtensions.has(extname(entry).toLowerCase()))
    .sort((left, right) => left.localeCompare(right));
}

function buildPrompt(pose, options) {
  const promptParts = [poseSpecs[pose].prompt];
  if (options.restoreQuality) {
    promptParts.push(restorationPrompt);
  }
  if (options.extra) {
    promptParts.push(`Additional instruction: ${options.extra}`);
  }
  return promptParts.join("\n\n");
}

async function filePart(filePath) {
  const bytes = await readFile(filePath);
  return new File([bytes], basename(filePath), { type: imageMimeType(filePath) });
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function compactErrorBody(body) {
  if (!body) return "";
  const withoutHtml = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutHtml.length > 500 ? `${withoutHtml.slice(0, 500)}...` : withoutHtml;
}

function shouldRetry(status) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function createImageEdit({ apiKey, productPath, targetPath, prompt, options }) {
  const productFile = await filePart(productPath);
  const targetFile = await filePart(targetPath);

  const buildForm = () => {
    const form = new FormData();
    form.append("model", options.model);
    form.append("prompt", prompt);
    form.append("size", options.size);
    form.append("quality", options.quality);
    if (options.inputFidelity !== "auto" && supportsInputFidelity(options.model)) {
      form.append("input_fidelity", options.inputFidelity);
    }
    form.append("output_format", options.format);
    form.append("image[]", productFile);
    form.append("image[]", targetFile);

    if (options.format === "jpeg" || options.format === "webp") {
      form.append("output_compression", "95");
    }

    return form;
  };

  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    let response;
    let responseText = "";

    try {
      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: buildForm(),
      });
      responseText = await response.text();
    } catch (error) {
      if (attempt < options.retries) {
        const delayMs = 2 ** attempt * 1500;
        console.warn(
          `  API request failed before a response (${error.message}). Retrying in ${Math.round(
            delayMs / 1000,
          )}s...`,
        );
        await sleep(delayMs);
        continue;
      }
      throw error;
    }

    if (response.ok) {
      return {
        requestId: response.headers.get("x-request-id"),
        body: JSON.parse(responseText),
      };
    }

    if (attempt < options.retries && shouldRetry(response.status)) {
      const delayMs = 2 ** attempt * 1500;
      console.warn(
        `  OpenAI image edit returned ${response.status}. Retrying in ${Math.round(
          delayMs / 1000,
        )}s...`,
      );
      await sleep(delayMs);
      continue;
    }

    const requestId = response.headers.get("x-request-id");
    const bodySummary = compactErrorBody(responseText);
    throw new Error(
      [
        `OpenAI image edit failed (${response.status})`,
        requestId ? `request id: ${requestId}` : null,
        bodySummary ? `response: ${bodySummary}` : null,
      ]
        .filter(Boolean)
        .join("; "),
    );
  }

  throw new Error("OpenAI image edit failed after retries.");
}

async function writeJson(filePath, payload) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function ensureWritableOutput(filePath, force) {
  if (existsSync(filePath) && !force) {
    throw new Error(`Output already exists. Pass --force to overwrite: ${filePath}`);
  }
}

async function processPose({ productPath, pose, options, apiKey }) {
  const slug = slugFromPath(productPath);
  const extension = outputExtension(options.format);
  const targetPath = options[poseSpecs[pose].targetOption];
  const prompt = buildPrompt(pose, options);
  const imagePath = join(options.outDir, `${slug}-${pose}.${extension}`);
  const promptPath = join(options.outDir, `${slug}-${pose}.prompt.txt`);
  const metadataPath = join(options.outDir, `${slug}-${pose}.metadata.json`);

  await ensureWritableOutput(imagePath, options.force || options.dryRun);
  await ensureWritableOutput(promptPath, options.force || options.dryRun);
  await ensureWritableOutput(metadataPath, options.force || options.dryRun);
  await writeFile(promptPath, prompt, "utf8");

  const metadata = {
    productPath,
    targetPath,
    pose,
    model: options.model,
    size: options.size,
    quality: options.quality,
    format: options.format,
    inputFidelity: options.inputFidelity,
    restoreQuality: options.restoreQuality,
    retries: options.retries,
    dryRun: options.dryRun,
    promptPath,
    imagePath,
    createdAt: new Date().toISOString(),
  };

  if (options.dryRun) {
    await writeJson(metadataPath, metadata);
    return { pose, imagePath: null, promptPath, metadataPath, dryRun: true };
  }

  const result = await createImageEdit({ apiKey, productPath, targetPath, prompt, options });
  const b64 = result.body?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`OpenAI response did not include an image for ${productPath} (${pose}).`);
  }

  await writeFile(imagePath, Buffer.from(b64, "base64"));
  await writeJson(metadataPath, {
    ...metadata,
    requestId: result.requestId,
    created: result.body.created,
    background: result.body.background,
    output_format: result.body.output_format,
    usage: result.body.usage,
  });

  return { pose, imagePath, promptPath, metadataPath, dryRun: false };
}

async function main() {
  const options = parseArgs(argv.slice(2));
  if (!options) return;
  await loadEnvFile(join(repoRoot, ".env.local"));
  await loadEnvFile(join(repoRoot, ".env"));

  assertPathExists(options.product, "Product path");
  assertPathExists(options.targetFront, "Front target reference");
  assertPathExists(options.targetAngle, "Angled target reference");
  await mkdir(options.outDir, { recursive: true });

  const apiKey = env[options.apiKeyEnv];
  if (!options.dryRun && !apiKey) {
    throw new Error(
      `${options.apiKeyEnv} is not set. Set it in your environment, .env.local, or run with --dry-run.`,
    );
  }

  const productPaths = await listProducts(options.product);
  if (productPaths.length === 0) {
    throw new Error(`No supported product images found in ${options.product}`);
  }

  const poses = options.only ? [options.only] : ["front", "angle"];
  const results = [];

  for (const productPath of productPaths) {
    console.log(`Processing ${productPath}`);
    for (const pose of poses) {
      const result = await processPose({ productPath, pose, options, apiKey });
      results.push(result);
      console.log(
        result.dryRun
          ? `  ${pose}: dry-run prompt written to ${result.promptPath}`
          : `  ${pose}: image written to ${result.imagePath}`,
      );
    }
  }

  await writeJson(join(options.outDir, "last-run.json"), {
    productCount: productPaths.length,
    poses,
    options: {
      ...options,
      apiKeyEnv: options.apiKeyEnv,
    },
    results,
    completedAt: new Date().toISOString(),
  });

  console.log(`Done. Output folder: ${options.outDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
