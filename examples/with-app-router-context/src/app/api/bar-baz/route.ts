// This is as of Next.js 14, but you could also use other dynamic functions
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  return Response.json({
    bar: process.env.BAR,
    baz: process.env.BAZ,
  });
}
