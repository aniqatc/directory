import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

// ESLint configuration for the project.
export default [
  { ignores: ['dist/', '.astro/', '.vercel/'] }, // Ignore build and temporary directories.
  ...tseslint.configs.recommended, // Recommended TypeScript ESLint rules.
  ...astro.configs.recommended, // Recommended Astro ESLint rules.
];
