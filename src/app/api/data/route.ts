import { NextResponse } from 'next/server';
import { readHomeData } from '@/lib/dataService';

export async function GET() {
  try {
    const data = readHomeData();
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading home data:', error);
    return NextResponse.json(
      { error: 'Failed to read home data' },
      { status: 500 }
    );
  }
}