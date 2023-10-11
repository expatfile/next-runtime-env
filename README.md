![GitHub branch checks state][build-url] [![codecov][cov-img]][cov-url] [![Known Vulnerabilities][snyk-img]][snyk-url]

# Next.js Runtime Environment Configuration

Populate your environment at **runtime** rather than **build time**.

- Isomorphic - Server and browser compatible (and even in middleware.)
- Next.js 13 App Router compatible.
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

`next-runtime-env` solves this problem by creating a context that exposes your environment variables at runtime, so you no longer have to declare
your environment variables at build time. The context provider safely exposes all environment variables prefixed with `NEXT_PUBLIC_` to the browser. This allows you to follow the build once, deploy many principle by providing differed runtime variables to the same build.

### Compatibility 🤝

Because `next-runtime-env` is build on top of server components it is only compatible with Next.js 13 App Router. Use [version 1.x][pages-router-branch-link] for Next.js 13 Page Router support.

### Getting started 🚀

Add the following lines to your `app/layout.tsx`:

```js
// app/layout.tsx
import { PublicEnvProvider } from 'next-runtime-env';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PublicEnvProvider>{children}</PublicEnvProvider>
      </body>
    </html>
  );
}

// By default server components are statically generated at build-time. To make
// sure the env vars are actually loaded use, add the following line to server
// components that use [env]. 👇
export const dynamic = 'force-dynamic';
```

The `PublicEnvProvider` will automatically expose all environment variables prefixed with `NEXT_PUBLIC_` to the context. If you want more control over which variables are exposed to the context, you can use the `EnvProvider` and define the exposed variables manually.

### Usage 🧑‍💻

In the browser your environment variables are now accessible using the `useEnvContext` hook. On the server you can use `process.env` because the layout is forced to be dynamic. For example:

```bash
# .env
NEXT_PUBLIC_FOO="foo"
BAR="bar"
```

> A `.env` file is not required, you can also declare your environment variables in whatever way you want.

```tsx
// app/client-page.tsx
'use client';

import { useEnvContext } from 'next-runtime-env';

export default function SomePage() {
    const { NEXT_PUBLIC_FOO } = useEnvContext();

  return (
    <main >
      NEXT_PUBLIC_FOO: {NEXT_PUBLIC_FOO}
    </main>
  );
}
```

```tsx
// app/server-page.tsx

export default function SomePage() {
  return (
    <main >
      BAR: {process.env.BAR}
    </main>
  );
}
```

### Utilities 🛠

We have included some utility function to make it even easier to work with
environment variables.

#### `makeEnvPublic(key: string | string[]): void`

Makes an environment variable with a given key public. This is useful if you
want to use an environment variable in the browser, but it was was not declared
with a `NEXT_PUBLIC_` prefix.

For ease of use you can also make multiple env vars public at once by passing an
array of keys.

##### Example

```js
// next.config.js
const { makeEnvPublic } = require('next-runtime-env');

// Given that `FOO` is declared as a regular env var, not a public one. This
// will make it public and available as `NEXT_PUBLIC_FOO`.
makeEnvPublic('FOO');

// Or you can make multiple env vars public at once.
makeEnvPublic(['BAR', 'BAZ']);
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
[pages-router-branch-link]: https://github.com/expatfile/next-runtime-env/tree/1.x
[nextjs-env-vars]: https://nextjs.org/docs/basic-features/environment-variables
[react-env-repo]: https://github.com/andrewmclagan/react-env
[expatfile-site]: https://expatfile.tax
