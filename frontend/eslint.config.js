import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // src/components/ui: componentes generados por shadcn/ui, se mantienen como vienen.
  {
    ignores: [
      "dist",
      ".output",
      ".vinxi",
      "coverage",
      "playwright-report",
      "test-results",
      "src/components/ui",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-unused-vars": "off",
    },
  },
  {
    // Tests (Vitest con globals) y archivos de configuración que corren en Node.
    files: ["**/*.test.{js,jsx}", "src/test/**", "e2e/**", "*.config.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
  },
  eslintPluginPrettier,
];
