import path from "node:path";
import fs from "node:fs";
import esbuild from "esbuild";
import ts from "typescript";
export const bundle = async (config) => {
    const { rootDir: inputRootDir, outDir: outputDir, worldcodeDir: configWorldcodeDir, codeblockDir: configCodeblockDir, minify, } = config;
    const rootDir = process.cwd();
    const outputPath = path.resolve(rootDir, outputDir);
    const srcPath = path.resolve(rootDir, inputRootDir);
    const tempDir = path.resolve(outputPath, ".temp");
    const tstempDir = path.resolve(outputPath, ".tstemp");
    // copy to temp
    fs.cpSync(srcPath, tstempDir, { recursive: true });
    // compile ts to js
    let tsconfig = {};
    const tsconfigPath = ts.findConfigFile(rootDir, ts.sys.fileExists);
    if (tsconfigPath == null) {
        tsconfig = {
            rootDir: tstempDir,
            outDir: tempDir,
            noEmit: false,
        };
    }
    else {
        const tsconfigFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
        const parsedTsConfig = ts.parseJsonConfigFileContent(tsconfigFile, ts.sys, rootDir);
        tsconfig = {
            ...parsedTsConfig,
            rootDir: tstempDir,
            outDir: tempDir,
            noEmit: false,
        };
    }
    const tsfiles = fs
        .readdirSync(tstempDir, { recursive: true })
        .filter((name) => typeof name === "string" &&
        name.endsWith(".ts") &&
        !name.endsWith(".d.ts")).map((name) => path.join(tstempDir, name));
    if (tsfiles.length === 0) {
        console.warn("no ts file.skip compile");
        fs.cpSync(tstempDir, tempDir, { recursive: true });
    }
    else {
        const program = ts.createProgram(tsfiles, tsconfig);
        const emit = program.emit();
        const diagnostics = ts
            .getPreEmitDiagnostics(program)
            .concat(emit.diagnostics);
        if (diagnostics.length > 0) {
            diagnostics.forEach((d) => console.error(`TS error: ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`));
        }
        if (emit.emitSkipped) {
            console.error("ts compile failed");
            fs.rmSync(tstempDir, { recursive: true, force: true });
            fs.rmSync(tempDir, { recursive: true, force: true });
            process.exit(1);
        }
    }
    fs.rmSync(tstempDir, { recursive: true, force: true });
    // worldcode
    const worldcodePath = path.resolve(tempDir, configWorldcodeDir);
    if (fs.existsSync(worldcodePath)) {
        const allWorldcodeFiles = fs
            .readdirSync(worldcodePath)
            .filter((name) => name.endsWith(".js"))
            .map((name) => "./" + name);
        const worldcodeImportText = allWorldcodeFiles
            .map((name) => `import "${name}";`)
            .join("\n");
        const worldcodeOutputPath = path.resolve(outputPath, configWorldcodeDir, "worldcode.js");
        await esbuild.build({
            stdin: {
                contents: worldcodeImportText,
                resolveDir: worldcodePath,
                sourcefile: "all-worldcode-import.js",
            },
            bundle: true,
            outfile: worldcodeOutputPath,
            platform: "neutral",
            format: "iife",
            target: "esnext",
            minify,
        });
    }
    else {
        console.warn("worldcode dir is none ", worldcodePath);
    }
    // codeblock
    const codeblockPath = path.resolve(tempDir, configCodeblockDir);
    if (fs.existsSync(codeblockPath)) {
        const allCodeBlockFilePath = fs
            .readdirSync(codeblockPath)
            .filter((filename) => filename.endsWith("js"))
            .map((filename) => path.join(codeblockPath, filename));
        await esbuild.build({
            entryPoints: allCodeBlockFilePath,
            bundle: true,
            outdir: path.resolve(outputPath, configCodeblockDir),
            minify,
            platform: "neutral",
            format: "iife",
            target: "esnext",
        });
    }
    else {
        console.warn("codeblock dir is none ", codeblockPath);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
};
