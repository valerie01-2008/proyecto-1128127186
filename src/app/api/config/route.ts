import { NextResponse } from 'next/server';
import { readAppConfig } from '@/lib/dataService';

export async function GET() {
  try {
    const data = readAppConfig();
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading app config:', error);
    return NextResponse.json(
      { error: 'Failed to read app config' },
      { status: 500 }
    );
  }
}