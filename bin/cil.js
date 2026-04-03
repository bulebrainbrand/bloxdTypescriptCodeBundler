#!/usr/bin/env node
import { bundle } from "../dist/bundler.js";
import { getConfig } from "../dist/getConfig.js";
await bundle(await getConfig());
