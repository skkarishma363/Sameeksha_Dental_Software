import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "out");
const subDirName = "Sameeksha_Dental_Software";
const targetDir = path.join(outDir, subDirName);

if (fs.existsSync(outDir)) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const items = fs.readdirSync(outDir);
  for (const item of items) {
    if (item === subDirName) continue;
    const srcPath = path.join(outDir, item);
    const destPath = path.join(targetDir, item);
    try {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } catch (err) {
      console.warn(`Warning: Could not mirror ${item}:`, err.message);
    }
  }
  console.log(`[mirror-build] Successfully mirrored out/ into out/${subDirName}/ for dual custom-domain and GitHub Pages subpath compatibility.`);
} else {
  console.log("[mirror-build] out/ directory does not exist, skipping mirror.");
}
