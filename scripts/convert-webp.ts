import sharp from "sharp";
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { execFileSync } from "child_process";
// @ts-ignore
import gifsicle from "gifsicle";

const DOCS_DIR = path.resolve("docs");
const IMAGE_EXT_REG = /\.(png|jpe?g|gif)$/i;

/**
 * 压缩 GIF 用 gifsicle，返回临时文件路径
 */
function compressGifWithGifsicle(input: string): string {
  const tempPath = input.replace(/\.gif$/i, ".optimized.gif");
  const colors = fs.statSync(input).size > 500 * 1024 ? 128 : 64;

  // 使用 npm 安装的 gifsicle 二进制
  execFileSync(
    gifsicle,
    ["--optimize=3", "--colors", colors.toString(), "-o", tempPath, input],
    { stdio: "ignore" },
  );

  return tempPath;
}

async function processImage(imagePath: string): Promise<void> {
  if (!IMAGE_EXT_REG.test(imagePath)) return;

  const absolutePath = path.resolve(imagePath);
  if (!fs.existsSync(absolutePath)) return;

  const isGif = /\.gif$/i.test(absolutePath);
  const webpPath = absolutePath.replace(IMAGE_EXT_REG, ".webp");
  let inputPath = absolutePath;
  let needCleanup = false;

  try {
    // GIF 先用 gifsicle 优化
    if (isGif) {
      inputPath = compressGifWithGifsicle(absolutePath);
      needCleanup = true;
    }

    // 统一转 WebP
    await sharp(inputPath, { animated: isGif })
      .webp({
        quality: isGif ? 90 : 100,
        effort: 6,
        lossless: !isGif,
        ...(isGif ? { loop: 0 } : {}),
      })
      .toFile(webpPath);

    // 清理
    if (needCleanup && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    fs.unlinkSync(absolutePath);

    // 更新 Markdown
    const oldFileName = path.basename(absolutePath);
    const newFileName = path.basename(webpPath);
    const mdFiles = globSync(`${DOCS_DIR.split(path.sep).join("/")}/**/*.md`);

    for (const mdFile of mdFiles) {
      const content = fs.readFileSync(mdFile, "utf-8");
      if (content.includes(oldFileName)) {
        fs.writeFileSync(
          mdFile,
          content.split(oldFileName).join(newFileName),
          "utf-8",
        );
      }
    }

    console.log(`✨ ${oldFileName} → ${newFileName}`);
  } catch (err) {
    console.error(`❌ ${imagePath}:`, err);
    if (needCleanup && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const globPatternDir = DOCS_DIR.split(path.sep).join("/");

  if (args.length > 0) {
    console.log("⚡ Staged Mode...");
    for (const file of args) await processImage(file);
  } else {
    console.log(`🔎 Scanning ${DOCS_DIR}...`);
    const images = globSync(`${globPatternDir}/**/*.{png,jpg,jpeg,gif}`);

    if (images.length === 0) {
      console.log("✅ No images found.");
      return;
    }

    console.log(`🚀 ${images.length} images found`);
    for (const img of images) await processImage(img);
    console.log("🏁 Done.");
  }
}

main().catch(console.error);
