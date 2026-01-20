import { noProcessEnvNextPublic } from './rules/no-process-env-next-public';

export const rules = {
  'no-process-env-next-public': noProcessEnvNextPublic,
};

const plugin = {
  rules,
  configs: {
    get recommended() {
      return {
        plugins: {
          'next-runtime-env': plugin,
        },
        rules: {
          'next-runtime-env/no-process-env-next-public': 'error' as const,
        },
      };
    },
  },
};

export default plugin;
