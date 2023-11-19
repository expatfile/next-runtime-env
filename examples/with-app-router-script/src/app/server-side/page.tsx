// This is as of Next.js 14, but you could also use other dynamic functions
import { unstable_noStore as noStore } from 'next/cache';
import { env } from 'next-runtime-env';

import styles from './page.module.css';

export default function ServerSide() {
  noStore(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          BAR: {env('BAR') /* This is the same as process.env.BAR */}
          <br />
          BAZ: {process.env.BAZ}
        </p>
      </div>
    </main>
  );
}
