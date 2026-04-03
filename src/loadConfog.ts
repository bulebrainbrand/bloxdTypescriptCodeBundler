import path from "node:path";
import fs from "node:fs";
export const loadConfog = async (): Promise<object | null> => {
  const rootDir = process.cwd();
  const configPath = path.resolve(rootDir, "bloxdBundler.config.json");
  if (!fs.existsSync(configPath)) {
    console.warn(
      `Not found bloxd.bundler.config.json (finded path: ${configPath})`,
    );
    console.log("Bloxd bundler is running default setting");
    return null;
  }
  try {
    const rawData = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(rawData);
    if (typeof config !== "object" || config == null) {
      console.error("confing format is invalid. ", configPath);
      process.exit(1);
    }
    return config;
  } catch (error) {
    console.error("on parse confog file: ", error);
    process.exit(1);
  }
};
