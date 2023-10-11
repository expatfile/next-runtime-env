# Getting started 🚀

1. First, install the package into your project:

```bash
npm install next-runtime-env
# or
yarn add next-runtime-env
# or
pnpm install next-runtime-env
```

2. Then wrap your component with RuntimeEnvProvider, for example in the root layout:

```tsx
// src/app/layout.tsx
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
```

> Keep in mind that the RuntimeEnvProvider must be added in a Server Component.

3. Next force dynamic generation for the Server Component by adding the following line:

```tsx
// src/app/layout.tsx

// ...

export const dynamic = 'force-dynamic';
```

> By default server components are statically generated at build-time. To make sure the env vars are actually loaded during runtime, you need to force dynamic generation.

4. Finally, use `useEnvContext` hook to access the runtime environment variables in your components:

```tsx
import { useEnvContext } from 'next-runtime-env';

export function MyComponent() {
  const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = useEnvContext();

  useEffect(() => {
    // some api call using NEXT_PUBLIC_BAZ
  }, [NEXT_PUBLIC_BAZ]);

  return <div>{NEXT_PUBLIC_FOO}</div>;
}
```

That's it! You can now use the next-runtime-env package to access runtime environment variables in your Next.js app.