import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "eslint-plugin-next";

export default tseslint.config(
  { ignores: ["dist", ".next", "node_modules"] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs.core-web-vitals.rules,
    },
  }
);
