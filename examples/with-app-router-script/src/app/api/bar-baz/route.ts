import { env } from 'next-runtime-env';

export async function GET() {
  return Response.json({
    bar: env('BAR'), // This is the same as process.env.BAR
    baz: process.env.BAZ,
  });
}
