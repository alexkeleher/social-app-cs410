import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import { FlatCompat } from "eslint/eslintrc";

const compat = new FlatCompat({
	baseDirectory: path.resolve(),
});


export default [
	...compat.extends([
		"plugin:prettier/recommended",
	]),

	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
		languageOptions:
		{
			globals: globals.browser
		},
		plugins: {
			prettier: prettierPlugin,
		},
	},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
