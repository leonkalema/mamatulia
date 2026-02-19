import { writeFile } from "node:fs/promises";

export type RedirectRow = {
  oldUrl: string;
  newUrl: string;
};

const escapeCsv = (value: string): string => {
  const normalized: string = value.replaceAll('"', '""');
  return `"${normalized}"`;
};

export const writeRedirectsCsv = async (filePath: string, redirects: RedirectRow[]): Promise<void> => {
  const header: string = "oldUrl,newUrl";
  const lines: string[] = redirects.map((row) => `${escapeCsv(row.oldUrl)},${escapeCsv(row.newUrl)}`);
  const contents: string = [header, ...lines].join("\n");
  await writeFile(filePath, contents, "utf8");
};
