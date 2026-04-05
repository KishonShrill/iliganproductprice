import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    // 1. Global Ignores (Must be in its own object block)
    {
        ignores: [
            'dist',
            'eslint.config.cjs',
            'mongodb_assets',
            '.env',
            'env.test.js',
            'server'
        ],
    },
    // 2. Main React Configuration
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser, // Replaces env: { browser: true }
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: { version: '18.2' },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // Replaces "extends"
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,

            // Your custom rules
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'react/prop-types': 'warn',
        },
    },
    // 3. UI Components Override
    {
        files: ['src/components/ui/*.{js,jsx}'],
        rules: {
            'react-refresh/only-export-components': 'off',
            'react/prop-types': 'off',
        },
    },
];
