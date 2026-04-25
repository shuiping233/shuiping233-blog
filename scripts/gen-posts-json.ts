import { readFileSync, writeFileSync, existsSync } from "fs";
import { glob } from "glob";
import { resolve, relative } from "path";
import { execSync } from "child_process";

interface Frontmatter {
  title?: string;
  createAt?: string;
  updateAt?: string;
  [key: string]: any;
}

// 白名单路径列表
const WHITELIST_PATHS = ["docs/posts"];

// Posts JSON 文件路径（放在 public 目录下以便 VitePress 构建时复制）
const POSTS_JSON_PATH = resolve(process.cwd(), "docs", "public", "posts.json");

// Posts JSON 数据结构
interface PostItem {
  title: string;
  path: string;
}

interface PostsJson {
  [date: string]: {
    created?: PostItem[];
    updated?: PostItem[];
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

/**
 * 从 Markdown 内容中提取第一个 # 一级标题
 */
function extractFirstHeading(body: string): string | null {
  // 匹配 # 标题（支持多种格式：# Title, #Title, #  Title）
  const headingRegex = /^#\s*(.+)$/m;
  const match = body.match(headingRegex);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * 获取文章标题
 * 优先从 frontmatter 读取，如果没有则读取第一个 # 一级标题
 */
function getPostTitle(frontmatter: Frontmatter | null, body: string): string {
  // 优先使用 frontmatter 的 title
  if (frontmatter?.title) {
    return frontmatter.title;
  }
  
  // 如果没有 frontmatter title，尝试提取第一个 # 标题
  const heading = extractFirstHeading(body);
  if (heading) {
    return heading;
  }
  
  // 如果都没有，返回默认标题
  return "Untitled";
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
 * 检查文件路径是否在白名单中
 */
function isInWhitelist(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return WHITELIST_PATHS.some(whitelist => 
    normalizedPath.includes(whitelist)
  );
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
  writeFileSync(POSTS_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * 扫描白名单文件夹中的所有 MD 文件并生成 posts.json
 */
async function generatePostsJson() {
  console.log("📝 Scanning whitelist folders for markdown files...\n");
  
  const postsJson: PostsJson = {};
  let processedCount = 0;
  let skippedCount = 0;

  // 扫描所有白名单路径
  for (const whitelistPath of WHITELIST_PATHS) {
    const fullPath = resolve(process.cwd(), whitelistPath);
    
    if (!existsSync(fullPath)) {
      console.warn(`⚠️  Path does not exist: ${whitelistPath}`);
      continue;
    }

    const files = await glob("**/*.md", {
      cwd: fullPath,
      absolute: true,
    });

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, "utf-8");
        const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);

        // 获取标题
        const title = getPostTitle(frontmatter, body);
        
        // 获取相对路径（从 docs 开始）
        const relativePath = filePathToRoute(relative(process.cwd(), filePath));
        
        // 获取创建和更新时间
        const createAt = frontmatter?.createAt;
        const updateAt = frontmatter?.updateAt;

        if (!createAt || !updateAt) {
          console.warn(`  ⚠️  Skipping (missing dates): ${relativePath}`);
          skippedCount++;
          continue;
        }

        // 创建 PostItem
        const postItem: PostItem = {
          title,
          path: relativePath,
        };

        // 添加到 created 数组（按 createAt 日期）
        if (!postsJson[createAt]) {
          postsJson[createAt] = {};
        }
        if (!postsJson[createAt].created) {
          postsJson[createAt].created = [];
        }
        // 检查是否已存在相同 path 的条目
        const existingCreated = postsJson[createAt].created?.find(
          item => item.path === relativePath
        );
        if (!existingCreated) {
          postsJson[createAt].created!.push(postItem);
        }

        // 如果 updateAt 不同于 createAt，添加到 updated 数组
        if (updateAt !== createAt) {
          if (!postsJson[updateAt]) {
            postsJson[updateAt] = {};
          }
          if (!postsJson[updateAt].updated) {
            postsJson[updateAt].updated = [];
          }
          // 检查是否已存在相同 path 的条目
          const existingUpdated = postsJson[updateAt].updated?.find(
            item => item.path === relativePath
          );
          if (!existingUpdated) {
            postsJson[updateAt].updated!.push(postItem);
          }
        }

        console.log(`  ✓ Processed: ${relativePath} (${title})`);
        processedCount++;
      } catch (e) {
        console.error(`  ❌ Error processing ${filePath}:`, e);
        skippedCount++;
      }
    }
  }

  // 对每个日期的数组按标题排序（可选，为了输出一致性）
  for (const date of Object.keys(postsJson)) {
    if (postsJson[date].created) {
      postsJson[date].created!.sort((a, b) => a.path.localeCompare(b.path));
    }
    if (postsJson[date].updated) {
      postsJson[date].updated!.sort((a, b) => a.path.localeCompare(b.path));
    }
  }

  // 写入文件
  writePostsJson(postsJson);
  
  // 将修改后的 posts.json 重新加入 stage
  try {
    execSync(`git add "${relative(process.cwd(), POSTS_JSON_PATH)}"`, {
      cwd: process.cwd(),
    });
  } catch (e) {
    console.warn("  ⚠️  Failed to stage posts.json");
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Processed: ${processedCount} files`);
  console.log(`  Skipped: ${skippedCount} files`);
  console.log(`  ✅ posts.json generated and staged`);
}

// 主函数
async function main() {
  await generatePostsJson();
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
