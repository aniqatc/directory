import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist/', '.astro/', '.vercel/'] },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];
