import { env } from 'next-runtime-env';

import styles from './page.module.css';

export default function ServerSide() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>BAR: {env('BAR')}</p>
      </div>
    </main>
  );
}

// By default server components are statically generated at build-time. To make
// sure the env vars are actually loaded use, add the following line to server
// components that use [env]. 👇
export const dynamic = 'force-dynamic';
