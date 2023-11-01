export async function GET() {
  return Response.json({
    bar: process.env.BAR,
    baz: process.env.BAZ,
  });
}

export const dynamic = 'force-dynamic';
