"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const string_hash_1 = __importDefault(require("string-hash"));
const path_1 = require("path");
const nextDataLoader = function (source) {
    const filename = this.resourcePath;
    return `
  import {createHook} from 'next/data'
  
  export default createHook(undefined, {key: ${JSON.stringify(path_1.basename(filename) + '-' + string_hash_1.default(filename))}})
  `;
};
exports.default = nextDataLoader;
