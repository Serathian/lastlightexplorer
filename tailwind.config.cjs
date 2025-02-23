const { default: daisyui } = require('daisyui');

module.exports = {
  content: ['./src/**/*.{vue,js,ts}'],
  plugins: [require("@tailwindcss/typography"), require('daisyui')],
  daisyui: {
    themes: ["dark"],
  }
};