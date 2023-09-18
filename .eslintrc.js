module.exports = {
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "vue/no-unused-vars": "off",
    "vue/no-side-effects-in-computed-properties": "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn", // or "error"
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },

  root: true,

  env: {
    node: true,
  },

  extends: [
    "plugin:vue/recommended",
    "plugin:vue/essential",
    "@vue/prettier",
    "@vue/typescript",
  ],

  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
};
