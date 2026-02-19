"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeRedirectsCsv = void 0;
const promises_1 = require("node:fs/promises");
const escapeCsv = (value) => {
    const normalized = value.replaceAll('"', '""');
    return `"${normalized}"`;
};
const writeRedirectsCsv = async (filePath, redirects) => {
    const header = "oldUrl,newUrl";
    const lines = redirects.map((row) => `${escapeCsv(row.oldUrl)},${escapeCsv(row.newUrl)}`);
    const contents = [header, ...lines].join("\n");
    await (0, promises_1.writeFile)(filePath, contents, "utf8");
};
exports.writeRedirectsCsv = writeRedirectsCsv;
