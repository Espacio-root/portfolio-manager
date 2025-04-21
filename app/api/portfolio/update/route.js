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
    
    const { symbol, quantity } = await request.json();
    
    if (!symbol || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Valid symbol and quantity are required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the stock in the portfolio
    const stockIndex = user.portfolio.findIndex(
      (stock) => stock.symbol === symbol
    );
    
    if (stockIndex === -1) {
      return NextResponse.json({ error: 'Stock not found in portfolio' }, { status: 404 });
    }
    
    // Update the quantity
    user.portfolio[stockIndex].quantity = quantity;
    
    await user.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    return NextResponse.json({ error: 'Failed to update stock quantity' }, { status: 500 });
  }
}
