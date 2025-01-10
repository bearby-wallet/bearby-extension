import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import pkg from "./package.json" with { type: "json" };


const watchMode = !!process.env.ROLLUP_WATCH;
const production = process.env.NODE_ENV == 'production';
const manifest = process.env.MANIFEST || 2;

console.log(`build for ${production ? 'production' : 'dev'}, watchmode: ${watchMode}, manifest: ${manifest}`);

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
        accessors: !production,
        immutable: !production,
      },
      emitCss: true,
      onwarn: (warning, handler) => {
        if (production) return;

        handler(warning);
      }
    }),
    postcss({
      extract: 'bundle.css',
      minimize: production,
      sourceMap: !production,
      plugins: [
        production && cssnano({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            cssDeclarationSorter: true,
            normalizeWhitespace: true,
            minifySelectors: true
          }],
        })
      ].filter(Boolean),
      onwarn: (warning) => {
        if (production) return;
        console.warn(warning);
      },
      inject: false,
      watch: production ? false : {
        clearScreen: false
      }
    }),
    resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
    commonjs({
       requireReturnsDefault: "auto"
    }),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    production && terser({
      format: { comments: false },
      compress: true,
    }),
  ].filter(Boolean),
  watch: production ? false : {
    clearScreen: false,
    include: ["popup/**"],
  },
  onwarn(warning, warn) {
    if (production) return;
    
    warn(warning);
  }
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
      browser: true,
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
  background,
  content
];
