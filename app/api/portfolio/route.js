import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '../../lib/db';
import User from '../../../models/User';

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update current prices for all stocks in portfolio
    const updatedPortfolio = [];
    
    for (const stock of user.portfolio) {
      try {
        // Fetch the current price for each stock
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?range=1d&interval=1d`
        );
        const data = await response.json();
        
        if (!data.chart.error) {
          const currentPrice = data.chart.result[0].indicators.quote[0].close.slice(-1)[0];
          
          updatedPortfolio.push({
            ...stock.toObject(),
            currentPrice
          });
        } else {
          // If there's an error fetching the current price, use the last known price
          updatedPortfolio.push(stock.toObject());
        }
      } catch (error) {
        // If there's an error, just use the existing data
        updatedPortfolio.push(stock.toObject());
      }
    }
    
    return NextResponse.json({ portfolio: updatedPortfolio });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
