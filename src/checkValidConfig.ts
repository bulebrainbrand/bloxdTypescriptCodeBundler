import type { ConfigInterface } from "./config.types.js";

export const checkValidConfig = (
  config: object,
): config is Partial<ConfigInterface> => {
  const validInterface: Record<keyof ConfigInterface, "string" | "boolean"> = {
    rootDir: "string",
    outDir: "string",
    worldcodeDir: "string",
    minify: "boolean",
    codeblockDir: "string",
  } as const;
  const validKeys = Object.keys(
    validInterface,
  ) as unknown as keyof ConfigInterface;
  const checkValidKey = (str: string): str is typeof validKeys => {
    return validKeys.includes(str);
  };
  const configEntries = Object.entries(config);
  for (const [key, value] of configEntries) {
    if (!checkValidKey(key)) {
      console.error(`unexpected key: ${key}`);
      process.exit(1);
    }
    const validType = validInterface[key];
    const valueType = typeof value;
    if (valueType !== validType) {
      console.error(`unexpected value: ${value} in key: ${key}`);
      process.exit(1);
    }
  }
  return true;
};
