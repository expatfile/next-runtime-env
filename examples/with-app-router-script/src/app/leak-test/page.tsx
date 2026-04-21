'use client';

import { env } from 'next-runtime-env';

export default function LeakTest() {
  return (
    <main>
      <p>HOME: {env('HOME')}</p>
      <p>PUBLIC: {env('NEXT_PUBLIC_FOO')}</p>
    </main>
  );
}
