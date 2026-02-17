import { defineConfig } from "eslint/config";

const baseConfig = defineConfig([
  {
    rules: {
      "no-console": "warn",
      "prefer-const": "error",
    },
  },
]);

export default baseConfig;
