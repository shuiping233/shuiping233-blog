import sharp from "sharp";
import fs from "fs";
import path from "path";
import { globSync } from "glob";

const DOCS_DIR = path.resolve("docs");
const IMAGE_EXT_REG = /\.(png|jpe?g|webp)$/i;

async function processImage(imagePath: string): Promise<void> {
  if (!IMAGE_EXT_REG.test(imagePath)) return;

  const absolutePath = path.resolve(imagePath);
  if (!fs.existsSync(absolutePath)) return;

  const isWebp = /\.webp$/i.test(absolutePath);
  const webpPath = absolutePath.replace(/\.(png|jpe?g)$/i, ".webp");

  if (isWebp) {
    console.log(`⏭️  Skip: ${path.basename(absolutePath)}`);
    return;
  }

  try {
    const beforeSize = fs.statSync(absolutePath).size;

    await sharp(absolutePath)
      .webp({
        quality: 100,
        effort: 6,
        lossless: true,
      })
      .toFile(webpPath);

    const afterSize = fs.statSync(webpPath).size;
    fs.unlinkSync(absolutePath);

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

    const saved = ((1 - afterSize / beforeSize) * 100).toFixed(1);
    console.log(
      `✨ ${oldFileName} (${(beforeSize / 1024).toFixed(1)}kb) → ${newFileName} (${(afterSize / 1024).toFixed(1)}kb) -${saved}%`,
    );
  } catch (err) {
    console.error(`❌ ${imagePath}:`, err);
    if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
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
    const images = globSync(`${globPatternDir}/**/*.{png,jpg,jpeg,webp}`); // 移除 gif

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
