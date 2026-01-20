// eslint-disable-next-line import/no-unresolved
import { RuleTester } from '@typescript-eslint/rule-tester';

import { noProcessEnvNextPublic } from './no-process-env-next-public';

// Polyfill for structuredClone which is not available in jsdom
if (typeof structuredClone !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).structuredClone = <T>(obj: T): T =>
    JSON.parse(JSON.stringify(obj));
}

RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester();

ruleTester.run('no-process-env-next-public', noProcessEnvNextPublic, {
  valid: [
    {
      name: 'using env() function for NEXT_PUBLIC_ variable',
      code: `
        import { env } from 'next-runtime-env';
        const value = env('NEXT_PUBLIC_API_URL');
      `,
    },
    {
      name: 'accessing non-NEXT_PUBLIC_ variable via process.env',
      code: `const nodeEnv = process.env.NODE_ENV;`,
    },
    {
      name: 'accessing private env variable',
      code: `const secret = process.env.SECRET_KEY;`,
    },
    {
      name: 'destructuring non-NEXT_PUBLIC_ variable',
      code: `const { NODE_ENV } = process.env;`,
    },
    {
      name: 'computed access without NEXT_PUBLIC_ prefix',
      code: `const value = process.env['SECRET'];`,
    },
    {
      name: 'dynamic access without NEXT_PUBLIC_ in identifier',
      code: `
        const key = 'FOO';
        const value = process.env[key];
      `,
    },
  ],
  invalid: [
    {
      name: 'process.env.NEXT_PUBLIC_* with identifier property',
      code: `const url = process.env.NEXT_PUBLIC_API_URL;`,
      output: `import { env } from 'next-runtime-env';
const url = env("NEXT_PUBLIC_API_URL");`,
      errors: [{ messageId: 'useEnvFunction' }],
    },
    {
      name: 'process.env["NEXT_PUBLIC_*"] with computed literal property',
      code: `const url = process.env['NEXT_PUBLIC_API_URL'];`,
      output: `import { env } from 'next-runtime-env';
const url = env("NEXT_PUBLIC_API_URL");`,
      errors: [{ messageId: 'useEnvFunctionComputed' }],
    },
    {
      name: 'adds env to existing next-runtime-env import',
      code: `import { PublicEnvScript } from 'next-runtime-env';
const url = process.env.NEXT_PUBLIC_API_URL;`,
      output: `import { PublicEnvScript, env } from 'next-runtime-env';
const url = env("NEXT_PUBLIC_API_URL");`,
      errors: [{ messageId: 'useEnvFunction' }],
    },
    {
      name: 'does not duplicate env import when already present',
      code: `import { env } from 'next-runtime-env';
const url = process.env.NEXT_PUBLIC_API_URL;`,
      output: `import { env } from 'next-runtime-env';
const url = env("NEXT_PUBLIC_API_URL");`,
      errors: [{ messageId: 'useEnvFunction' }],
    },
    {
      name: 'destructuring NEXT_PUBLIC_ from process.env warns without fix',
      code: `const { NEXT_PUBLIC_API_URL } = process.env;`,
      errors: [{ messageId: 'useEnvFunctionDestructuring' }],
    },
    {
      name: 'multiple NEXT_PUBLIC_ destructured variables',
      code: `const { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_FOO } = process.env;`,
      errors: [
        { messageId: 'useEnvFunctionDestructuring' },
        { messageId: 'useEnvFunctionDestructuring' },
      ],
    },
    {
      name: 'dynamic access with NEXT_PUBLIC_ in inline template literal',
      code: `const value = process.env[\`NEXT_PUBLIC_\${suffix}\`];`,
      errors: [{ messageId: 'useEnvFunctionDynamic' }],
    },
    {
      name: 'dynamic access with NEXT_PUBLIC_ concatenation',
      code: `const value = process.env['NEXT_PUBLIC_' + varName];`,
      errors: [{ messageId: 'useEnvFunctionDynamic' }],
    },
  ],
});
