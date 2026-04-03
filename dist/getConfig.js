import { checkValidConfig } from "./checkValidConfig.js";
import { loadConfog } from "./loadConfog.js";
export const getConfig = async () => {
    const defaultConfig = {
        rootDir: "./src",
        outDir: "./dist",
        worldcodeDir: "./worldcode",
        minify: true,
        codeblockDir: "./codeblock",
    };
    const configInput = await loadConfog();
    if (configInput == null)
        return defaultConfig;
    if (!checkValidConfig(configInput))
        process.exit(1);
    return { ...defaultConfig, ...configInput };
};
