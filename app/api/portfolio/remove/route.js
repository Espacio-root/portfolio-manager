import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { symbol } = await request.json();
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove the stock from portfolio
    user.portfolio = user.portfolio.filter(
      (stock) => stock.symbol !== symbol
    );
    
    await user.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing stock from portfolio:', error);
    return NextResponse.json({ error: 'Failed to remove stock from portfolio' }, { status: 500 });
  }
}
