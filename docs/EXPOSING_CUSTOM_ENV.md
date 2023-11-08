# Exposing custom environment variables 🛠

You might not only want to expose environment variables that are prefixed with `NEXT_PUBLIC_`. In this case you can use the `EnvProvider` to expose custom environment variables to the context.

## Example

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