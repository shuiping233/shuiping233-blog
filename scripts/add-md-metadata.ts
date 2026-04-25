import { readFileSync, writeFileSync, statSync, existsSync } from "fs";
import { glob } from "glob";
import { resolve, relative, dirname } from "path";
import { execSync } from "child_process";

interface Frontmatter {
  createAt?: string;
  updateAt?: string;
  [key: string]: any;
}

// 白名单路径列表
const WHITELIST_PATHS = ["docs/posts"];

// Posts JSON 文件路径
const POSTS_JSON_PATH = resolve(process.cwd(), "docs", "posts.json");

// Posts JSON 数据结构
interface PostsJson {
  [date: string]: {
    created?: string[];
    updated?: string[];
  };
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

/**
 * 检查文件路径是否在白名单中
 */
function isInWhitelist(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return WHITELIST_PATHS.some(whitelist => 
    normalizedPath.includes(whitelist)
  );
}

/**
 * 转换文件路径为路由路径
 * docs/posts/hello.md → /posts/hello
 */
function filePathToRoute(filePath: string): string {
  // 移除 docs 前缀和 .md 后缀
  const route = filePath
    .replace(/\\/g, "/")
    .replace(/^docs/, "")
    .replace(/\.md$/, "");
  return route;
}

/**
 * 读取 posts.json
 */
function readPostsJson(): PostsJson {
  if (!existsSync(POSTS_JSON_PATH)) {
    return {};
  }
  try {
    const content = readFileSync(POSTS_JSON_PATH, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.warn("⚠️  Failed to read posts.json, creating new one");
    return {};
  }
}

/**
 * 写入 posts.json
 */
function writePostsJson(data: PostsJson) {
  writeFileSync(POSTS_JSON_PATH, JSON.stringify(data, null, 4), "utf-8");
}

/**
 * 从数组中移除指定元素（如果存在）
 */
function removeFromArray(arr: string[] | undefined, item: string): string[] {
  if (!arr) return [];
  return arr.filter(i => i !== item);
}

/**
 * 添加元素到数组（如果不存在）
 */
function addToArray(arr: string[] | undefined, item: string): string[] {
  if (!arr) return [item];
  if (arr.includes(item)) return arr;
  return [...arr, item];
}

/**
 * 从所有日期条目中删除指定路径
 */
function removePathFromAllDates(postsJson: PostsJson, routePath: string): PostsJson {
  const newJson: PostsJson = {};
  
  for (const [date, entry] of Object.entries(postsJson)) {
    const newEntry: { created?: string[]; updated?: string[] } = {};
    
    if (entry.created) {
      const newCreated = removeFromArray(entry.created, routePath);
      if (newCreated.length > 0) {
        newEntry.created = newCreated;
      }
    }
    
    if (entry.updated) {
      const newUpdated = removeFromArray(entry.updated, routePath);
      if (newUpdated.length > 0) {
        newEntry.updated = newUpdated;
      }
    }
    
    // 只有当 entry 还有内容时才保留
    if (newEntry.created || newEntry.updated) {
      newJson[date] = newEntry;
    }
  }
  
  return newJson;
}

/**
 * 添加新文章记录
 */
function addCreatedRecord(postsJson: PostsJson, routePath: string, createAt: string): PostsJson {
  const newJson = { ...postsJson };
  
  if (!newJson[createAt]) {
    newJson[createAt] = {};
  }
  
  newJson[createAt].created = addToArray(newJson[createAt].created, routePath);
  
  return newJson;
}

/**
 * 添加更新记录
 */
function addUpdatedRecord(postsJson: PostsJson, routePath: string, updateAt: string, createAt: string): PostsJson {
  // 如果创建日期和更新日期相同，不记录 updated
  if (createAt === updateAt) {
    return postsJson;
  }
  
  const newJson = { ...postsJson };
  
  if (!newJson[updateAt]) {
    newJson[updateAt] = {};
  }
  
  // 检查该日期的 updated 数组中是否已存在该路径
  const existingUpdated = newJson[updateAt].updated || [];
  if (!existingUpdated.includes(routePath)) {
    newJson[updateAt].updated = [...existingUpdated, routePath];
  }
  
  return newJson;
}

/**
 * 获取 staged 的 markdown 文件及其状态
 * 返回 [{ path: "docs/posts/hello.md", status: "A" }, ...]
 */
function getStagedMdFiles(): { path: string; status: string }[] {
  try {
    // 获取 staged 文件及其状态
    const output = execSync(
      'git diff --cached --name-status --diff-filter=ACDMR -- "*.md"',
      { encoding: "utf-8", cwd: process.cwd() }
    );
    
    if (!output.trim()) {
      return [];
    }
    
    const files: { path: string; status: string }[] = [];
    
    output.trim().split("\n").forEach(line => {
      // 格式: "A\tfilepath" 或 "M\tfilepath" 或 "D\tfilepath"
      const parts = line.split("\t");
      if (parts.length >= 2) {
        const status = parts[0];
        const filePath = parts[1];
        // 只处理白名单路径下的文件
        if (isInWhitelist(filePath)) {
          files.push({ path: filePath, status });
        }
      }
    });
    
    return files;
  } catch (e) {
    return [];
  }
}

/**
 * 更新 posts.json
 */
async function updatePostsJson(stagedFiles: { path: string; status: string }[]) {
  if (stagedFiles.length === 0) {
    return;
  }
  
  console.log(`\n📝 Updating posts.json for ${stagedFiles.length} file(s)...`);
  
  let postsJson = readPostsJson();
  let hasChanges = false;
  
  for (const { path: filePath, status } of stagedFiles) {
    const routePath = filePathToRoute(filePath);
    const fullPath = resolve(process.cwd(), filePath);
    
    if (status === "D") {
      // 删除操作：从所有日期条目中移除
      postsJson = removePathFromAllDates(postsJson, routePath);
      console.log(`  🗑️  Removed: ${routePath}`);
      hasChanges = true;
    } else if (status === "A") {
      // 新增操作
      // 先检查文件是否存在（可能刚被创建）
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, "utf-8");
        const { frontmatter } = parseFrontmatter(content);
        
        if (frontmatter?.createAt) {
          postsJson = addCreatedRecord(postsJson, routePath, frontmatter.createAt);
          console.log(`  ➕ Created: ${routePath} (${frontmatter.createAt})`);
          hasChanges = true;
        }
      }
    } else if (status === "M") {
      // 修改操作
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, "utf-8");
        const { frontmatter } = parseFrontmatter(content);
        
        if (frontmatter?.updateAt && frontmatter?.createAt) {
          postsJson = addUpdatedRecord(postsJson, routePath, frontmatter.updateAt, frontmatter.createAt);
          if (frontmatter.updateAt !== frontmatter.createAt) {
            console.log(`  ✏️  Updated: ${routePath} (${frontmatter.updateAt})`);
          } else {
            console.log(`  ➕ Created: ${routePath} (${frontmatter.createAt})`);
          }
          hasChanges = true;
        }
      }
    }
  }
  
  if (hasChanges) {
    writePostsJson(postsJson);
    
    // 将修改后的 posts.json 重新加入 stage
    try {
      execSync(`git add "${relative(process.cwd(), POSTS_JSON_PATH)}"`, {
        cwd: process.cwd(),
      });
      console.log("  ✅ posts.json updated and staged");
    } catch (e) {
      console.warn("  ⚠️  Failed to stage posts.json");
    }
  } else {
    console.log("  ℹ️  No changes needed in posts.json");
  }
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
  
  // 在 pre-commit 模式下，更新 posts.json
  if (isPreCommit) {
    const stagedFiles = getStagedMdFiles();
    if (stagedFiles.length > 0) {
      await updatePostsJson(stagedFiles);
    }
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
