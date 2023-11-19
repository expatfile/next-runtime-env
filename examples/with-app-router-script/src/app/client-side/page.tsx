'use client';

import { env } from 'next-runtime-env';

import styles from './page.module.css';

export default function ClientSide() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          NEXT_PUBLIC_FOO: {env('NEXT_PUBLIC_FOO')}
          <br />
          NEXT_PUBLIC_BAZ: {env('NEXT_PUBLIC_BAZ')}
        </p>
      </div>
    </main>
  );
}
