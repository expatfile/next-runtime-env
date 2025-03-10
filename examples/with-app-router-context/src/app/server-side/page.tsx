// This is as of Next.js 15, but you could also use other dynamic functions
import { connection } from 'next/server';

import styles from './page.module.css';

export default async function ServerSide() {
  await connection(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          BAR: {process.env.BAR}
          <br />
          BAZ: {process.env.BAZ}
        </p>
      </div>
    </main>
  );
}
