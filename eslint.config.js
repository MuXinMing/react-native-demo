// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "semi": ["error", "never"],
      "quotes": ["error", "double"],
      "jsx-quotes": ["error", "prefer-double"],
      "react-hooks/exhaustive-deps": "off"
    },
    ignores: ["dist/*"],
  },
])
