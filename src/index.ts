#!/usr/bin/env node
import { bundle } from "./bundler.js";
import { getConfig } from "./getConfig.js";

await bundle(await getConfig());
