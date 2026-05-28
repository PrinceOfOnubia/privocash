/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };

    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "light_wasm_hasher_bg.wasm": path.resolve(
          __dirname,
          "node_modules/@lightprotocol/hasher.rs/dist/light_wasm_hasher_bg.wasm"
        ),
        "hasher_wasm_simd_bg.wasm": path.resolve(
          __dirname,
          "node_modules/@lightprotocol/hasher.rs/dist/hasher_wasm_simd_bg.wasm"
        ),
      };

      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.resolve.extensions = [
      ".wasm",
      ".mjs",
      ".js",
      ".ts",
      ".tsx",
      ".json",
      ".jsx",
      ...(config.resolve.extensions ?? []),
    ];

    return config;
  },
};

module.exports = nextConfig;
