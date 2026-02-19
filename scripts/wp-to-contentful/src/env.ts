import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

type EnvRecord = Record<string, string>;

type LoadEnvOptions = {
  paths?: string[];
};

const parseDotEnv = (contents: string): EnvRecord => {
  const env: EnvRecord = {};
  const lines: string[] = contents.split(/\r?\n/);
  for (const rawLine of lines) {
    const line: string = rawLine.trim();
    if (!line.length || line.startsWith("#")) {
      continue;
    }
    const index: number = line.indexOf("=");
    if (index < 1) {
      continue;
    }
    const key: string = line.slice(0, index).trim();
    const valueRaw: string = line.slice(index + 1).trim();
    const value: string = valueRaw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    env[key] = value;
  }
  return env;
};

const loadEnvFile = async (filePath: string): Promise<void> => {
  if (!existsSync(filePath)) {
    return;
  }
  const contents: string = await readFile(filePath, "utf8");
  const parsed: EnvRecord = parseDotEnv(contents);
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

export const loadEnv = async (options?: LoadEnvOptions): Promise<void> => {
  const paths: string[] = options?.paths ?? [".env", ".env.local"];
  for (const filePath of paths) {
    await loadEnvFile(filePath);
  }
};
