import fs from "fs";
import path from "path";

/**
 * Check if file exists
 * @param path path to check if exists
 */
export const fileExists = (path: string): boolean => {
  return fs.existsSync(path);
};

/**
 * Resolve paths relative to current src directory __dirname
 * @param paths paths to resolve relative to __dirname file
 */
export const resolveRelativeToFile = (paths: string[]): string => {
  return path.join(__dirname, ...paths);
};

/**
 * Resolve paths relative to current app home
 * @param paths paths to resolve relative to process.cwd()
 */
export const resolveRelativeToApp = (...paths: string[]): string => {
  return path.join(process.cwd(), ...paths);
};

/**
 * Resove relative to nothing
 * @param paths paths to resolve relative
 */
export const resolveRelative = (...paths: string[]): string => {
  return path.join(...paths);
};

/**
 * Resolve file into canonical format
 * @param file file path to resolve into canonical format
 */
export const resolveFullPath = (file: string): string => {
  return path.resolve(file);
};

/**
 * Create new Folder, skip if already exist
 * @param path path to folder
 */
export const createFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

/**
 * Write string to file, overwrite if file exists
 * @param path path to write payload to
 * @param payload string payload to write into file
 */
export const writeFile = (path: string, payload: string) => {
  return fs.writeFileSync(path, payload);
};

/**
 * Write string to relative addressed file, overwrite if file exists
 * @param file relative addressed file to write payload to
 * @param payload string payload to write into file
 */
export const writeRelativeToFile = (file: string, payload: string) => {
  writeFile(resolveRelativeToFile([file]), payload);
};

/**
 * Write string to relative addressed file to app, overwrite if file exists
 * @param file relative addressed file to app to write payload to
 * @param payload string payload to write into file
 */
export const writeRelativeToApp = (file: string, payload: string) => {
  writeFile(resolveRelativeToApp(file), payload);
};

export const readFile = (
  path: string,
  useEncoding: BufferEncoding = "utf8",
) => {
  return fs.readFileSync(path, { encoding: useEncoding, flag: "r" });
};

/**
 * Read payload and parse into <T> Type
 * @param file file path to read from
 */
export const readJson = <T>(file: string): T | undefined => {
  const filePath = resolveFullPath(file);
  if (!fileExists(filePath)) {
    return undefined;
  }

  const payload = fs.readFileSync(filePath);
  if (!payload) {
    return undefined;
  }

  const jsonPayload: T = JSON.parse(payload.toString());
  if (!jsonPayload) {
    return undefined;
  }
  return jsonPayload;
};
