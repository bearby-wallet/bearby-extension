import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import { sass } from 'svelte-preprocess-sass';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import nodePolyfills from 'rollup-plugin-node-polyfills';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;


const popup = {
	input: 'popup/main.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'popup',
		file: 'dist/bundle.js'
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
				style: sass()
			}),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		production && terser({
			format: {
				comments: false
			},
			compress: true
		})
	],
	watch: {
		clearScreen: false,
		include: ["popup/**"]
	}
};
const background = {
	input: 'core/background/index.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'background',
		file: 'dist/background.js'
	},
	plugins: [
		commonjs(),
		resolve({
			jsnext: true,   
			main: true,
			brower: true,
			preferBuiltins: false
		}),
		nodePolyfills(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		production && visualizer({
			filename: 'background.html'
		}),
		json(),
		copy({
			targets: [
				{
					src: 'public/icons',
					dest: 'dist/'
				},
				{
					src: 'public/fonts',
					dest: 'dist/'
				},
				{
					src: 'public/lang',
					dest: 'dist/'
				},
				{
					src: 'public/imgs',
					dest: 'dist/'
				},
				{
					src: 'public/phishing.html',
					dest: 'dist/'
				},
				{
					src: 'public/index.html',
					dest: 'dist/'
				},
				{
					src: 'public/manifest.json',
					dest: 'dist/',
					transform: (contents) => {
						const jsonContent = JSON.parse(contents)

						jsonContent.version = pkg.version;
						jsonContent.short_name = pkg.shortName;
						jsonContent.description = pkg.description;
						jsonContent.author = pkg.homepage;

						return JSON.stringify(jsonContent, null, 2);
					}
				}
			]
		}),
		production && terser({
			format: {
				comments: false
			},
			compress: true
		})
	]
};
const content = {
	input: 'core/content/index.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'content',
		file: 'dist/content.js'
	},
	plugins: [
		commonjs(),
		resolve({
			jsnext: true,   
			main: true,
			brower: true,
			preferBuiltins: false
		}),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		production && visualizer({
			filename: 'content.html'
		}),
		production && terser({
			format: {
				comments: false
			},
			compress: true
		})
	]
};

export default [
	popup,
	background,
	content
];
