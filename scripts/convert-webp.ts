import sharp from "sharp";
import fs from "fs";
import path from "path";
import { globSync } from "glob";

/**
 * 路径配置
 */
const DOCS_DIR = path.resolve("docs");
// 匹配常见的图片格式
const IMAGE_EXT_REG = /\.(png|jpe?g|gif)$/i;

/**
 * 转换单张图片并更新所有 Markdown 引用
 */
async function processImage(imagePath: string): Promise<void> {
  if (!IMAGE_EXT_REG.test(imagePath)) return;

  const absolutePath = path.resolve(imagePath);
  if (!fs.existsSync(absolutePath)) return;

  const isGif = /\.gif$/i.test(absolutePath);
  // 生成新的 webp 路径
  const webpPath = absolutePath.replace(IMAGE_EXT_REG, ".webp");

  try {
    // 1. 开始转换
    // 对于 GIF，必须在构造函数开启 animated: true 才能保留动图帧
    await sharp(absolutePath, { animated: isGif })
      .webp({
        quality: 80, // 降低质量以大幅减小体积，技术博客 60 足够了
        effort: 6, // 消耗更多 CPU 换取更小的体积
        ...(isGif ? { loop: 0 } : {}),
      })
      .toFile(webpPath);

    // 2. 转换成功后删除原图
    fs.unlinkSync(absolutePath);

    // 3. 全局扫描并替换 Markdown 文件中的文件名
    const oldFileName = path.basename(absolutePath);
    const newFileName = path.basename(webpPath);

    // 获取所有 md 文件列表
    const mdFiles = globSync(`${DOCS_DIR}/**/*.md`);

    for (const mdFile of mdFiles) {
      const content = fs.readFileSync(mdFile, "utf-8");
      if (content.includes(oldFileName)) {
        // 使用 split/join 替换，简单高效
        const updatedContent = content.split(oldFileName).join(newFileName);
        fs.writeFileSync(mdFile, updatedContent, "utf-8");
      }
    }

    console.log(`✨ [Success]: ${oldFileName} -> ${newFileName}`);
  } catch (err) {
    console.error(`❌ [Error] ${imagePath}:`, err);
  }
}

/**
 * 主程序入口
 */
async function main() {
  const args = process.argv.slice(2);

  // 统一处理成正斜杠路径给 glob 使用
  const globPatternDir = DOCS_DIR.split(path.sep).join("/");

  if (args.length > 0) {
    console.log("⚡ Running in Staged Mode (Pre-commit)...");
    for (const file of args) {
      await processImage(file);
    }
  } else {
    console.log(`🔎 Scanning all images in: ${DOCS_DIR}`);
    // 使用统一后的路径
    const foundImages = globSync(`${globPatternDir}/**/*.{png,jpg,jpeg,gif}`);

    if (foundImages.length === 0) {
      console.log("✅ No compatible images found.");
      // 调试：打印一下它到底扫的是哪里，方便你排查
      console.log(
        `Debug: Searched pattern was ${globPatternDir}/**/*.{png,jpg,jpeg,gif}`,
      );
      return;
    }

    console.log(
      `🚀 Found ${foundImages.length} images. Starting conversion...`,
    );
    for (const imgPath of foundImages) {
      await processImage(imgPath);
    }
    console.log("🏁 Batch conversion finished.");
  }
}

main().catch(console.error);
