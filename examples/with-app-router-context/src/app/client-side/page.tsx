'use client';

import { useEnvContext } from 'next-runtime-env';

import styles from './page.module.css';

export default function ClientSide() {
  const { NEXT_PUBLIC_FOO, NEXT_PUBLIC_BAZ } = useEnvContext();

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          NEXT_PUBLIC_FOO: {NEXT_PUBLIC_FOO}
          <br />
          NEXT_PUBLIC_BAZ: {NEXT_PUBLIC_BAZ}
        </p>
      </div>
    </main>
  );
}
