module.exports = {
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "vue/no-unused-vars": "off",
    "vue/no-side-effects-in-computed-properties": "off"
  },

  root: true,

  env: {
    node: true
  },

  extends: [
    "plugin:vue/recommended",
    "plugin:vue/essential",
    "@vue/prettier",
    "@vue/typescript"
  ],

  parserOptions: {
    parser: "@typescript-eslint/parser"
  }
};
