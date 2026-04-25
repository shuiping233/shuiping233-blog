import { readFileSync, writeFileSync, statSync } from "fs";
import { glob } from "glob";
import { resolve, relative } from "path";
import { execSync } from "child_process";

interface Frontmatter {
  createAt?: string;
  updateAt?: string;
  [key: string]: any;
}

function parseFrontmatter(content: string): {
  frontmatter: Frontmatter | null;
  body: string;
  hasFrontmatter: boolean;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: null, body: content, hasFrontmatter: false };
  }

  const frontmatterText = match[1];
  const body = content.slice(match[0].length);
  const frontmatter: Frontmatter = {};

  // Parse YAML frontmatter
  frontmatterText.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      frontmatter[key] = value.replace(/^["']|["']$/g, "");
    }
  });

  return { frontmatter, body, hasFrontmatter: true };
}

function formatFrontmatter(frontmatter: Frontmatter): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined && value !== null) {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function getFileDates(filePath: string): { createAt: string; updateAt: string } {
  const stats = statSync(filePath);
  const createAt = (stats.birthtime || stats.ctime)
    .toISOString()
    .split("T")[0];
  const updateAt = stats.mtime.toISOString().split("T")[0];
  return { createAt, updateAt };
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

async function processSingleFile(filePath: string, isPreCommit: boolean): Promise<boolean> {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);

    if (isPreCommit) {
      // pre-commit 模式：强制更新 updateAt 为当前时间
      const newFrontmatter: Frontmatter = frontmatter || {};
      const today = getToday();

      // 如果没有 createAt，添加它（使用文件创建时间）
      if (!newFrontmatter.createAt) {
        const { createAt } = getFileDates(filePath);
        newFrontmatter.createAt = createAt;
      }

      // 强制更新 updateAt 为当前时间
      newFrontmatter.updateAt = today;

      const newContent = formatFrontmatter(newFrontmatter) + "\n\n" + body.trim();
      writeFileSync(filePath, newContent, "utf-8");

      // 将修改后的文件重新加入 stage
      try {
        execSync(`git add "${relative(process.cwd(), filePath)}"`, {
          cwd: process.cwd(),
        });
      } catch (e) {
        console.warn(`⚠️  Failed to stage: ${filePath}`);
      }

      return true;
    } else {
      // 普通模式：只在缺少字段时添加
      if (frontmatter?.createAt && frontmatter?.updateAt) {
        return false; // 跳过，已有完整元数据
      }

      const { createAt, updateAt } = getFileDates(filePath);
      const newFrontmatter: Frontmatter = frontmatter || {};

      // Only add missing fields
      if (!newFrontmatter.createAt) {
        newFrontmatter.createAt = createAt;
      }
      if (!newFrontmatter.updateAt) {
        newFrontmatter.updateAt = updateAt;
      }

      const newContent =
        formatFrontmatter(newFrontmatter) + "\n\n" + body.trim();
      writeFileSync(filePath, newContent, "utf-8");

      return true;
    }
  } catch (e) {
    console.error(`❌ Error processing ${filePath}:`, e);
    return false;
  }
}

async function processAllFiles() {
  const docsPath = resolve(process.cwd(), "docs");
  const files = await glob("**/*.md", {
    cwd: docsPath,
    absolute: true,
  });

  console.log(`📝 Processing all ${files.length} markdown files...\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const filePath of files) {
    const updated = await processSingleFile(filePath, false);
    if (updated) {
      console.log(`✓ Updated: ${filePath.replace(docsPath, "docs")}`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Updated: ${updatedCount} files`);
  console.log(`  Skipped: ${skippedCount} files (already has metadata)`);

  if (updatedCount > 0) {
    console.log("\n✨ Metadata has been updated successfully!");
  }
}

async function main() {
  // 获取命令行参数
  const args = process.argv.slice(2);
  const isPreCommit = process.env.GIT_HOOKS_HUSKY === "true";

  if (args.length > 0) {
    // lint-staged 模式：处理传入的单个文件
    const filePath = resolve(process.cwd(), args[0]);
    
    // 只处理 docs 目录下的文件
    if (!filePath.includes("docs")) {
      process.exit(0);
    }

    const updated = await processSingleFile(filePath, isPreCommit);
    if (updated) {
      console.log(`✓ ${isPreCommit ? "Pre-commit" : "Updated"}: ${args[0]}`);
    }
  } else {
    // 普通模式：处理所有文件
    await processAllFiles();
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
