## Getting Started

First, run the development server:

```bash
NEXT_PUBLIC_FOO=foo-value BAR=bar-value npm run dev
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value yarn dev
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value pnpm dev
```

Open [http://localhost:3000/client-side](http://localhost:3000/client-side) or
[http://localhost:3000/server-side](http://localhost:3000/server-side) with your
browser to see the development result.

Next, build the app without the environment variables:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Finally, run the production server with the environment variables:

```bash
NEXT_PUBLIC_FOO=foo-value BAR=bar-value npm run start
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value yarn start
# or
NEXT_PUBLIC_FOO=foo-value BAR=bar-value pnpm start
```

Open [http://localhost:3000/client-side](http://localhost:3000/client-side) or
[http://localhost:3000/server-side](http://localhost:3000/server-side) with your
browser to see the production result.
