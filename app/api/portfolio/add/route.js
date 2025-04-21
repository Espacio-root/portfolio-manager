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
    
    const { symbol, price } = await request.json();
    
    if (!symbol || !price) {
      return NextResponse.json({ error: 'Symbol and price are required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if stock already exists in portfolio
    const existingStockIndex = user.portfolio.findIndex(
      (stock) => stock.symbol === symbol
    );
    
    if (existingStockIndex !== -1) {
      return NextResponse.json({ error: 'Stock already in portfolio' }, { status: 400 });
    }
    
    // Add stock to portfolio
    user.portfolio.push({
      symbol,
      purchasePrice: price,
      currentPrice: price,
      quantity: 1,
      addedAt: new Date()
    });
    
    await user.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding stock to portfolio:', error);
    return NextResponse.json({ error: 'Failed to add stock to portfolio' }, { status: 500 });
  }
}
