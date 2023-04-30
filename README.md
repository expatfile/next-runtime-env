# next-runtime-env - Runtime Environment Configuration

![GitHub branch checks state][build-url] [![codecov][cov-img]][cov-url]

Populates your environment at **run-time** rather than **build-time**.

- Isomorphic - Server, browser and middleware compatible.
- Supports static site generation.
- Supports `.env`, just like [Next.js][nextjs-env-vars].

Runtime environment variables are used in common best-practice patterns for
building modern apps deployed via Docker. A big selling point of using Docker to
begin with is to be able to build one image and have it work everywhere - dev,
test, staging, production, etc - and having to "bake" in environment-specific
configuration at build-time is antithetical to that goal. `next-runtime-env`
aims to remove this hurdle by adding support for runtime environment variables
to Next.js without sacrificing static site generation support.

### Getting started 🚀

1. Add the following lines to your `next.config.js`:

```js
const { configureRuntimeEnv } = require('next-runtime-env/build/configure');

configureRuntimeEnv();
```

When the server starts this will generates a `__ENV.js` file in the `public`
folder that contains allow-listed environment variables that have a
`NEXT_PUBLIC_` prefix.

2. Add the following to the head section fo your `pages/_document.js`:

```jsx
// pages/_document.tsx
<script src="/__ENV.js" />
```

Done!

### Usage 🧑‍💻

In the browser your variables will be available at
`window.__ENV.NEXT_PUBLIC_FOO` and on the server `process.env.NEXT_PUBLIC_FOO`.

#### Helper 😉

We have included a helper function to make retrieving a value easier:

```bash
# .env
NEXT_PUBLIC_FOO="foo"
BAR="bar"
```

```jsx
type Props = {
  bar: string,
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

Becomes...

```jsx
import { env } from 'next-runtime-env';

type Props = {
  bar: string,
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

### Maintenance 👷

This package is maintained and used by [Expatfile.tax][expatfile-site].
The #1 US expat tax e-filing software. 🇺🇸

### Other work 📚

Big thanks to the [react-env][react-env-repo]
project, which inspired us. 🙏

[build-url]: https://img.shields.io/github/checks-status/expatfile/next-runtime-env/main
[cov-img]: https://codecov.io/gh/expatfile/next-runtime-env/branch/main/graph/badge.svg?token=mbGgsweFuP
[cov-url]: https://codecov.io/gh/expatfile/next-runtime-env
[nextjs-env-vars]: https://nextjs.org/docs/basic-features/environment-variables
[react-env-repo]: https://github.com/andrewmclagan/react-env
[expatfile-site]: https://expatfile.tax
