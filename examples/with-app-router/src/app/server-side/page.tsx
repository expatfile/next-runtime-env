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
