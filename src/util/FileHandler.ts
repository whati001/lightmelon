import fs from 'fs';
import path from 'path';

export const fileExists = (path: string): boolean => {
  return fs.existsSync(path);
}

export const resolveRelativeFile = (file: string): string => {
  return path.join(__dirname, './../',file);
}

export const writeFile = (path: string, payload: string) => {
  return fs.writeFileSync(path, payload);
}

export const writeRelativeFile = (file: string, payload: string) => {
  console.log(resolveRelativeFile(file));
  writeFile(resolveRelativeFile(file), payload);
}

export const readJson = (file: string) => {
  if (!fileExists(file)) {
    return undefined;
  }
  const payload = fs.readFileSync(file);
  if (payload) {
    const jsonPayload = JSON.parse(payload.toString());
    if (jsonPayload) {
      return jsonPayload;
    }
    return undefined;
  }
}