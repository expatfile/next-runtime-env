# next-runtime-env - Runtime Environment Configuration

[![codecov](https://codecov.io/gh/expatfile/next-runtime-env/branch/main/graph/badge.svg?token=mbGgsweFuP)](https://codecov.io/gh/expatfile/next-runtime-env)

Populates your environment at **run-time** rather than **build-time**.

- Isomorphic - Server, browser and middleware compatible.
- Supports static site generation.
- Supports `.env`, just like [Next.js](https://nextjs.org/docs/basic-features/environment-variables).

Runtime environment variables are used in common best-practice patterns for building modern apps deployed via Docker. A big selling point of using Docker to begin with is to be able to build one image and have it work everywhere - dev, test, staging, production, etc - and having to "bake" in environment-specific configuration at build-time is antithetical to that goal. `next-runtime-env` aims to remove this hurdle by adding support for runtime environment variables to Next.js without sacrificing static site generation support.

### Getting started 🚀

1. Add the following lines to your `next.config.js`:

```js
const {
  configureRuntimeEnv,
} = require('next-runtime-env/build/configure-runtime-env');

configureRuntimeEnv();
```

This will generates a `__ENV.js` file that contains allow-listed environment variables that have a `NEXT_PUBLIC_` prefix.

2. Add the following to the head section fo your `pages/_document.js`:

```jsx
// pages/_document.tsx
<script src="/__ENV.js" />
```

Done!

### Usage 🧑‍💻

In the browser your variables will be available at `window.__ENV.NEXT_PUBLIC_FOO` and on the server `process.env.NEXT_PUBLIC_FOO`.

#### Helper 😉

We have included a helper function to make retrieving a value easier:

```bash
# .env
NEXT_PUBLIC_NEXT="Next.js"
NEXT_PUBLIC_CRA="Create React App"
NEXT_PUBLIC_NOT_SECRET_CODE="1234"
```

Becomes...

```jsx
import { env } from 'next-runtime-env';

export default (props) => (
  <div>
    <small>
      Works in the browser: <b>{env('NEXT_PUBLIC_CRA')}</b>.
    </small>
    <small>
      Also works for server side rendering: <b>{env('NEXT_PUBLIC_NEXT')}</b>.
    </small>
    <form>
      <input type="hidden" defaultValue={env('NEXT_PUBLIC_NOT_SECRET_CODE')} />
    </form>
  </div>
);
```

### Maintenance 👷

This package is maintained and used by [Expatfile.tax](https://expatfile.tax). The #1 US expat tax e-filing software. 🇺🇸

### Other work 📚

Big thanks to the [react-env](https://github.com/andrewmclagan/react-env) project, which inspired us. 🙏
