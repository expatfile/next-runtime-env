# Making env public 🛠

In some cases you might have control over the naming of the environment variables. (Or you simply don't want to prefix them with `NEXT_PUBLIC_`.) In this case you can use the `makeEnvPublic` utility function to make them public.

## Example

```ts
// next.config.js

const { makeEnvPublic } = require('next-runtime-env');

// Given that `FOO` is declared as a regular env var, not a public one. This
// will make it public and available as `NEXT_PUBLIC_FOO`.
makeEnvPublic('FOO');

// Or you can make multiple env vars public at once.
makeEnvPublic(['BAR', 'BAZ']);
```

> You can also use the experimental instrumentation hook introduced in Next.js 13. See the `with-app-router` example for more details.
