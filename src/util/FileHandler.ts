import fs from 'fs';

export const fileExists = (path: string): boolean => {
  return fs.existsSync(path);
}

// TODO: fix it later, it's nasty
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