import styles from './page.module.css';

export default function ServerSide() {
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
