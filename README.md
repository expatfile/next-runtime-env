![GitHub branch checks state][build-url] [![codecov][cov-img]][cov-url] [![Known Vulnerabilities][snyk-img]][snyk-url]

# Next.js Runtime Environment Configuration

Populate your environment at **runtime** rather than **build time**.

- Isomorphic - Server and browser compatible (and even in middleware.)
- Static site generation support.
- `.env` support during development, just like [Next.js][nextjs-env-vars-order].

### Why we created this package 🤔

[Build once, deploy many][build-once-deploy-many-link] is an essential principle
of software development. The main idea is to use the same bundle for all
environments, from testing to production. This approach enables easy deployment
and testability and is considered a
[fundamental principle of continuous delivery][fundamental-principle-link]. It
is also part of the [twelve-factor methodology][twelve-factor-link]. As crucial
as it is, it has yet to receive significant support in the world of front-end
development, and Next.js is no exception.

Next.js does support [environment variables][nextjs-env-vars], but only at
build time. This means you must rebuild your app for each target environment,
which violates the principle. But what if you want, or need, to follow the build
once, deploy many principle?

### This package 📦

`next-runtime-env` solves this problem by generating a JavaScript file that
contains the environment variables at runtime, so you no longer have to declare
your environment variables at build time. This file is loaded in the client,
safely exposing those variables to the browser. This allows you to follow the
build once, deploy many principle by providing differed runtime variables to the
same build.

### Compatibility 🤝

Our approach is compatible with
[static site generation][static-generation-link] and supports middleware.

For Next.js 13 App Router support, user `next-runtime-env@2.0.0` or higher.

### Getting started 🚀

1. Add the following lines to your `next.config.js`:

```js
const { configureRuntimeEnv } = require('next-runtime-env/build/configure');

configureRuntimeEnv();
```

When the server starts, this generates an `__ENV.js` file in the `public` folder
containing allow-listed environment variables with a `NEXT_PUBLIC_` prefix.

2. Add the following to the head section of your `pages/_document.js`:

```tsx
// pages/_document.tsx
<script src="/__ENV.js" />
```

This will load the generated file in the browser.

### Usage 🧑‍💻

In the browser, your variables will now be available at
`window.__ENV.NEXT_PUBLIC_FOO` and on the server at
`process.env.NEXT_PUBLIC_FOO`. For example:

```bash
# .env
NEXT_PUBLIC_FOO="foo"
BAR="bar"
NEXT_PUBLIC_BAZ="baz"
```

```tsx
// pages/some-page.tsx
type Props = {
  bar: string;
};

export default function SomePage({ bar }: Props) {
  return (
    <div>
      {window.__ENV.NEXT_PUBLIC_FOO} {bar}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      bar: process.env.BAR,
    },
  };
};
```

### Utilities 🛠

We have included some utility function to make it even easier to work with
environment variables.

#### `env(key: string): string | undefined`

Returns the value of the environment variable with the given key. If the
environment variable is not found, it returns undefined.

##### Example

```tsx
// pages/some-page.tsx
import { env } from 'next-runtime-env';

type Props = {
  bar: string;
};

export default function SomePage({ bar }: Props) {
  return (
    <div>
      {env('NEXT_PUBLIC_FOO')} {bar}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      bar: env('BAR'),
    },
  };
};
```

#### `allEnv(): ProcessEnv`

Returns all environment variables as a `ProcessEnv` object regardless of
the platform. This is useful if you want to destructure multiple env vars at
once.

##### Example

```tsx
// pages/some-page.tsx
import { allEnv } from 'next-runtime-env';

type Props = {
  bar: string;
};

export default function SomePage({ bar }: Props) {
  const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = allEnv();

  return (
    <div>
      {NEXT_PUBLIC_FOO} {NEXT_PUBLIC_BAZ} {bar}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { BAR } = allEnv();

  return {
    props: {
      bar: BAR,
    },
  };
};
```

#### `makeEnvPublic(key: string | string[]): void`

Makes an environment variable with a given key public. This is useful if you
want to use an environment variable in the browser, but it was was not declared
with a `NEXT_PUBLIC_` prefix.

For ease of use you can also make multiple env vars public at once by passing an
array of keys.

##### Example

```js
// next.config.js
const { configureRuntimeEnv } = require('next-runtime-env/build/configure');
const { makeEnvPublic } = require('next-runtime-env/build/make-env-public');

// Given that `FOO` is declared as a regular env var, not a public one. This
// will make it public and available as `NEXT_PUBLIC_FOO`.
makeEnvPublic('FOO');

// Or you can make multiple env vars public at once.
makeEnvPublic(['BAR', 'BAZ']);

// This will generate the `__ENV.js` file and include `NEXT_PUBLIC_FOO`.
configureRuntimeEnv();
```

### Maintenance 👷

This package is maintained and actively used by [Expatfile.tax][expatfile-site].
The #1 US expat tax e-filing software. 🇺🇸

### Other work 📚

Big thanks to the [react-env][react-env-repo] project, which inspired us. 🙏

[build-url]: https://img.shields.io/github/checks-status/expatfile/next-runtime-env/main
[cov-img]: https://codecov.io/gh/expatfile/next-runtime-env/branch/main/graph/badge.svg?token=mbGgsweFuP
[cov-url]: https://codecov.io/gh/expatfile/next-runtime-env
[snyk-img]: https://snyk.io/test/github/expatfile/next-runtime-env/badge.svg
[snyk-url]: https://snyk.io/test/github/expatfile/next-runtime-env
[nextjs-env-vars-order]: https://nextjs.org/docs/basic-features/environment-variables#environment-variable-load-order
[build-once-deploy-many-link]: https://www.mikemcgarr.com/blog/build-once-deploy-many.html
[fundamental-principle-link]: https://cloud.redhat.com/blog/build-once-deploy-anywhere
[twelve-factor-link]: https://12factor.net
[static-generation-link]: https://nextjs.org/docs/basic-features/pages#static-generation
[nextjs-env-vars]: https://nextjs.org/docs/basic-features/environment-variables
[react-env-repo]: https://github.com/andrewmclagan/react-env
[expatfile-site]: https://expatfile.tax
