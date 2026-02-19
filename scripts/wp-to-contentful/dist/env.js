"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = void 0;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const parseDotEnv = (contents) => {
    const env = {};
    const lines = contents.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.length || line.startsWith("#")) {
            continue;
        }
        const index = line.indexOf("=");
        if (index < 1) {
            continue;
        }
        const key = line.slice(0, index).trim();
        const valueRaw = line.slice(index + 1).trim();
        const value = valueRaw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
        env[key] = value;
    }
    return env;
};
const loadEnvFile = async (filePath) => {
    if (!(0, node_fs_1.existsSync)(filePath)) {
        return;
    }
    const contents = await (0, promises_1.readFile)(filePath, "utf8");
    const parsed = parseDotEnv(contents);
    for (const [key, value] of Object.entries(parsed)) {
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
};
const loadEnv = async (options) => {
    const paths = options?.paths ?? [".env", ".env.local"];
    for (const filePath of paths) {
        await loadEnvFile(filePath);
    }
};
exports.loadEnv = loadEnv;
