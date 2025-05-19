module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	parserOptions: {
		parser: 'babel-eslint',
	},
	extends: [
		'@nuxtjs',
		'eslint:recommended',
		'prettier',
		'plugin:prettier/recommended',
		'prettier/vue',
		'plugin:nuxt/recommended',
	],
	plugins: ['prettier'],
	globals: {
		$nuxt: true,
	},
	rules: {
		'vue/no-v-html': 0,
		'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
		'no-console': process.env.CONTEXT === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.CONTEXT === 'production' ? 'error' : 'off',
		'max-len': [
			'warn',
			180,
			1,
			{
				ignoreUrls: true,
				ignoreComments: true,
				ignoreRegExpLiterals: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
			},
		],
		'prettier/prettier': [
			1,
			{
				endOfLine: 'auto',
			},
		],
		'unicorn/number-literal-case': 0,
		'no-bitwise': 0, // KUTE.js wants this
	},
}