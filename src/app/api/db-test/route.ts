// src/app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  console.log('Attempting database connection test...');
  try {
    const db = await getDb();
    console.log('Pinging database...');
    const pingResult = await db.admin().ping();
    console.log('Database ping successful:', pingResult);

    return NextResponse.json(
      { message: 'Database connection successful!', ping: pingResult },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('API DB Test Error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: 'Database connection failed.', error: errorMessage },
      { status: 500 }
    );
  }
}
