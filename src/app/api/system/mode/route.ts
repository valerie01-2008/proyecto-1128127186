import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export const GET = async () => {
  try {
    const mode = await getSystemMode();
    return NextResponse.json({ mode });
  } catch (error) {
    console.error('Error getting system mode:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};