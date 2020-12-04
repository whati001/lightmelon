import fs from 'fs';
import path from 'path';

export const fileExists = (path: string): boolean => {
  return fs.existsSync(path);
};

export const resolveRelativeToFile = (file: string): string => {
  return path.join(__dirname, file);
};

export const resolveRelativeToApp = (file: string): string => {
  return path.join(process.cwd(), file);
};

export const writeFile = (path: string, payload: string) => {
  return fs.writeFileSync(path, payload);
};

export const writeRelativeToFile = (file: string, payload: string) => {
  writeFile(resolveRelativeToFile(file), payload);
};

export const writeRelativeToApp = (file: string, payload: string) => {
  writeFile(resolveRelativeToApp(file), payload);
};
export const readJson = <T>(file: string) => {
  if (!fileExists(file)) {
    return undefined;
  }
  const payload = fs.readFileSync(file);
  if (payload) {
    const jsonPayload: T = JSON.parse(payload.toString());
    if (jsonPayload) {
      return jsonPayload;
    }
    return undefined;
  }
};