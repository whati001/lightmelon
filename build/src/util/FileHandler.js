"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = exports.writeFile = exports.fileExists = void 0;
const fs_1 = __importDefault(require("fs"));
const fileExists = (path) => {
    return fs_1.default.existsSync(path);
};
exports.fileExists = fileExists;
const writeFile = (path, payload) => {
    return fs_1.default.writeFileSync(path, payload);
};
exports.writeFile = writeFile;
// TODO: fix it later, it's nasty
const readJson = (file) => {
    if (!exports.fileExists(file)) {
        return undefined;
    }
    const payload = fs_1.default.readFileSync(file);
    if (payload) {
        const jsonPayload = JSON.parse(payload.toString());
        if (jsonPayload) {
            return jsonPayload;
        }
        return undefined;
    }
};
exports.readJson = readJson;
