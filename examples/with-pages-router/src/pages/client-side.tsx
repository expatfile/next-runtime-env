import { Inter } from 'next/font/google';
import Head from 'next/head';
import { env } from 'next-runtime-env';

import styles from '@/styles/Home.module.css';

const inter = Inter({ subsets: ['latin'] });

export default function Demo() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <p>NEXT_PUBLIC_FOO: {env('NEXT_PUBLIC_FOO')}</p>
        </div>
      </main>
    </>
  );
}
