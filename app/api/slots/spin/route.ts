import { spinSlots } from '@/lib/slots';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { payWithPoints = false, pointsCost = 0 } = body;

    // Call slot machine server action
    const result = await spinSlots(payWithPoints, pointsCost);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Slot spin error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during spin',
      },
      { status: 500 }
    );
  }
}
