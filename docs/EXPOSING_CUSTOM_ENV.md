# Exposing custom environment variables 🛠

You might not only want to expose environment variables that are prefixed with `NEXT_PUBLIC_`. In this case you can use the `EnvProvider` to expose custom environment variables to the context.

## Example

```tsx
// app/layout.tsx

import { EnvProvider } from 'next-runtime-env';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <EnvProvider
          env={{
            NEXT_PUBLIC_: process.env.NEXT_PUBLIC_FOO,
            BAR: process.env.BAR,
            BAZ: process.env.BAZ,
            notAnEnvVar: 'not-an-env-var',
          }}
        >
          {children}
        </EnvProvider>
      </body>
    </html>
  );
}

// By default server components are statically generated at build-time. To make
// sure the env vars are actually loaded use, add the following line to server
// components that use [env]. 👇
export const dynamic = 'force-dynamic';
```