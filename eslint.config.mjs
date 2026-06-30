import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app*', mode: 'full' },

        { type: 'core', pattern: 'src/core*', mode: 'full' },

        { type: 'shared', pattern: 'src/shared*', mode: 'full' },

        { type: 'providers', pattern: 'src/providers*', mode: 'full' },

        {
          type: 'domain',
          pattern: 'src/features*',
          mode: 'full',
          capture: ['featureName'],
        },
        {
          type: 'application',
          pattern: 'src/features*',
          mode: 'full',
          capture: ['featureName'],
        },
        {
          type: 'infrastructure',
          pattern: 'src/features*',
          mode: 'full',
          capture: ['featureName'],
        },
        {
          type: 'presentation',
          pattern: 'src/features*',
          mode: 'full',
          capture: ['featureName'],
        },
        {
          type: 'feature-public',
          pattern: 'src/features/*/index.ts',
          mode: 'full',
          capture: ['featureName'],
        },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: {
                to: {
                  type: [
                    'app',
                    'presentation',
                    'application',
                    'shared',
                    'core',
                    'providers',
                    'feature-public',
                  ],
                },
              },
            },
            {
              from: { type: 'providers' },
              allow: {
                to: { type: ['providers', 'application', 'shared', 'core', 'feature-public'] },
              },
            },
            {
              from: { type: 'presentation' },
              allow: { to: { type: ['presentation', 'application', 'domain', 'shared', 'core'] } },
            },
            {
              from: { type: 'application' },
              allow: {
                to: { type: ['application', 'domain', 'infrastructure', 'core', 'shared'] },
              },
            },
            {
              from: { type: 'infrastructure' },
              allow: { to: { type: ['infrastructure', 'domain', 'core'] } },
            },
            {
              from: { type: 'domain' },
              allow: { to: { type: ['domain', 'core'] } },
            },
            {
              from: { type: 'shared' },
              allow: { to: { type: ['shared', 'core'] } },
            },
            {
              from: { type: 'core' },
              allow: { to: { type: ['core'] } },
            },
            {
              from: { type: 'feature-public' },
              allow: { to: { type: ['presentation', 'application', 'domain'] } },
            },
          ],
        },
      ],
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
