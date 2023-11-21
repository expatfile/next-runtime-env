import { env } from 'next-runtime-env';

import styles from './page.module.css';

export default function ServerSide() {
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
