// This is as of Next.js 15, but you could also use other dynamic functions
import { connection } from 'next/server';

export async function GET() {
  await connection(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  return Response.json({
    bar: process.env.BAR,
    baz: process.env.BAZ,
  });
}
