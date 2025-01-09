import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import pkg from "./package.json" with { type: "json" };


const production = !process.env.ROLLUP_WATCH;
const manifest = process.env.MANIFEST || 2;

const popup = {
  input: "popup/main.ts",
  output: {
    sourcemap: !production,
    format: "iife",
    name: "popup",
    file: "dist/bundle.js",
  },
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
      compilerOptions: {
        dev: !production,
      },
    }),
    css({ output: "bundle.css" }),
    resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
    commonjs({
       requireReturnsDefault: "auto"
    }),
    typescript({
      inlineSources: true,
      sourceMap: !production,
      inlineSources: !production,
    }),
    production && terser({
      format: { comments: false },
      compress: true,
    }),
  ],
  watch: {
    clearScreen: true,
    include: ["popup/**"],
  },
};
const background = {
  input: "core/background/index.ts",
  output: {
    sourcemap: !production,
    format: "iife",
    name: "background",
    file: "dist/background.js",
  },
  plugins: [
    nodePolyfills(),
    typescript({
      inlineSources: true,
      sourceMap: !production,
      inlineSources: !production,
    }),
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      brower: true,
      preferBuiltins: false,
    }),
    production &&
      visualizer({
        filename: "background.html",
      }),
    json(),
    copy({
      targets: [
        {
          src: "public/icons",
          dest: "dist/",
        },
        {
          src: "public/fonts",
          dest: "dist/",
        },
        {
          src: "public/lang",
          dest: "dist/",
        },
        {
          src: "public/imgs",
          dest: "dist/",
        },
        {
          src: "public/phishing.html",
          dest: "dist/",
        },
        {
          src: "public/index.html",
          dest: "dist/",
        },
        {
          src: `public/manifest_${manifest}.json`,
          dest: "dist/",
          rename: "manifest.json",
          transform: (contents) => {
            const jsonContent = JSON.parse(contents);

            jsonContent.version = pkg.version;
            jsonContent.short_name = pkg.shortName;
            jsonContent.description = pkg.description;
            jsonContent.author = pkg.homepage;

            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ],
    }),
    production &&
      terser({
        format: {
          comments: false,
        },
        compress: true,
      }),
  ],
};
const content = {
  input: "core/content/index.ts",
  output: {
    sourcemap: !production,
    format: "iife",
    name: "content",
    file: "dist/content.js",
  },
  plugins: [
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      brower: true,
      preferBuiltins: false,
    }),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    production &&
      visualizer({
        filename: "content.html",
      }),
    production &&
      terser({
        format: {
          comments: false,
        },
        compress: true,
      }),
  ],
};

export default [
  popup,
  // background,
  // content
];
