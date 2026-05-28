/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "..", "node_modules", "@lightprotocol", "hasher.rs", "dist");
const target = path.join(dist, "browser-fat", "es");
const wasmFiles = ["light_wasm_hasher_bg.wasm", "hasher_wasm_simd_bg.wasm"];

if (fs.existsSync(dist) && fs.existsSync(target)) {
  for (const file of wasmFiles) {
    const source = path.join(dist, file);
    const destination = path.join(target, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
    }
  }
}
