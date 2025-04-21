import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, { params }) {
  try {
    const { symbol } = params;
    
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: "Error fetching stock data" }, { status: 500 });
  }
}
