import { join as pathJoin } from "path";
import { promises as fs } from "fs";

export { pathJoin };

export async function readDir(dirPath: string): Promise<string[]> {
  return await fs.readdir(dirPath);
}

export async function access(dirPath: string): Promise<void> {
  return await fs.access(dirPath);
}

export async function readFile(path: string): Promise<string> {
  return (await fs.readFile(path)).toString();
}

export async function writeFile(path: string, contents: string): Promise<void> {
  return await fs.writeFile(path, contents);
}

export async function readJSON<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path)) as T;
}
