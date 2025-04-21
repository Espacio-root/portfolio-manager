import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '../../../lib/db';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ inPortfolio: false });
    }
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ inPortfolio: false });
    }
    
    // Check if stock is in portfolio
    const stockExists = user.portfolio.some(
      (stock) => stock.symbol === symbol
    );
    
    return NextResponse.json({ inPortfolio: stockExists });
  } catch (error) {
    console.error('Error checking portfolio:', error);
    return NextResponse.json({ inPortfolio: false });
  }
}
