import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2);

async function convert() {
  for (const file of files) {
    // 扩展匹配正则，加入 gif
    if (!/\.(png|jpe?g|gif)$/i.test(file)) continue;

    const isGif = /\.gif$/i.test(file);
    const webpFile = file.replace(/\.(png|jpe?g|gif)$/i, '.webp');
    
    try {
      // 核心修改：如果是 GIF，读取时必须传入 animated: true
      let pipeline = sharp(file, { animated: isGif });

      await pipeline
        .webp({ 
          quality: 60, 
          effort: 6, // 压缩效率，越高越慢但体积更小
          // 如果是动图，可以开启一些特定优化
          ...(isGif ? { loop: 0, delay: undefined } : {}) 
        })
        .toFile(webpFile);

      // 删除原图
      fs.unlinkSync(file);

      // 替换 Markdown 里的引用
      const fileName = path.basename(file);
      const webpName = path.basename(webpFile);
      replaceInDocs(fileName, webpName);
      
      console.log(`Successfully converted: ${fileName} -> ${webpName}`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }
}

// replaceInDocs 逻辑保持不变...