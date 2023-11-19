# Exposing custom environment variables 🛠

- [Exposing custom environment variables 🛠](#exposing-custom-environment-variables-)
  - [Using the script approach (recommend)](#using-the-script-approach-recommend)
    - [Example](#example)
  - [Using the context approach](#using-the-context-approach)
    - [Example](#example-1)

## Using the script approach (recommend)

You might not only want to expose environment variables that are prefixed with `NEXT_PUBLIC_`. In this case you can use the `EnvScript` to expose custom environment variables to the browser.

### Example

```tsx
// app/layout.tsx
// This is as of Next.js 14, but you could also use other dynamic functions
import { unstable_noStore as noStore } from 'next/cache';
import { EnvScript } from 'next-runtime-env';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  return (
    <html lang="en">
      <head>
        <EnvScript
          env={{
            NEXT_PUBLIC_: process.env.NEXT_PUBLIC_FOO,
            BAR: process.env.BAR,
            BAZ: process.env.BAZ,
            notAnEnvVar: 'not-an-env-var',
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## Using the context approach

You might not only want to expose environment variables that are prefixed with `NEXT_PUBLIC_`. In this case you can use the `EnvProvider` to expose custom environment variables to the context.

### Example

```tsx
// app/layout.tsx
// This is as of Next.js 14, but you could also use other dynamic functions
import { unstable_noStore as noStore } from 'next/cache';
import { EnvProvider } from 'next-runtime-env';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
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
```