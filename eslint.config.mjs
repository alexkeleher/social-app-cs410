import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";


export default [
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
