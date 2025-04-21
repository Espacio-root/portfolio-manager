import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { stockData } = await request.json();
    
    if (!stockData || !stockData.chart || !stockData.chart.result) {
      return NextResponse.json({ error: "Invalid stock data provided" }, { status: 400 });
    }
    
    const result = stockData.chart.result[0];
    const prices = result.indicators.quote[0].close;
    const currentPrice = prices[prices.length - 1];
    const startPrice = prices[0];
    const priceChange = ((currentPrice - startPrice) / startPrice) * 100;
    
    // Simple algorithm to generate recommendation based on price movement
    let recommendation;
    let analysis = "";
    
    // Determine recommendation based on price change percentage
    if (priceChange > 5) {
      recommendation = "SELL";
      analysis = `The stock has shown a significant increase of ${priceChange.toFixed(2)}% recently. This might be a good opportunity to take profits.\n\nThe momentum appears strong, but markets often experience corrections after rapid gains. Consider your investment time horizon and risk tolerance before making a decision.\n\nTechnical indicators suggest the stock may be approaching an overbought condition.`;
    } else if (priceChange < -5) {
      recommendation = "BUY";
      analysis = `The stock has declined by ${Math.abs(priceChange).toFixed(2)}% from the starting point of our data. This dip might present a buying opportunity if you believe in the long-term prospects of the company.\n\nConsider dollar-cost averaging instead of a lump-sum purchase to mitigate potential further downside.\n\nThe current price point could offer a favorable entry if the company fundamentals remain strong.`;
    } else {
      recommendation = "HOLD";
      analysis = `The stock has shown relatively stable movement with a ${priceChange.toFixed(2)}% change. Current price action doesn't indicate a strong signal either way.\n\nIt's advisable to monitor the stock for clearer directional movement before making any significant changes to your position.\n\nKeep an eye on upcoming news, earnings reports, or industry trends that might impact the stock's trajectory.`;
    }
    
    // Add volatility analysis
    const prices7d = prices.slice(-7);
    const volatility = calculateVolatility(prices7d);
    if (volatility > 2) {
      analysis += `\n\nNote: This stock is showing high volatility (${volatility.toFixed(2)}% daily average movement), which increases both risk and potential reward.`;
    } else if (volatility < 0.5) {
      analysis += `\n\nNote: This stock is showing unusually low volatility (${volatility.toFixed(2)}% daily average movement), which may suggest calm before potential price movement.`;
    }
    
    return NextResponse.json({
      recommendation,
      analysis
    });
  } catch (error) {
    console.error('Error generating stock analysis:', error);
    return NextResponse.json({ error: "Error generating stock analysis" }, { status: 500 });
  }
}

// Calculate average daily volatility
function calculateVolatility(prices) {
  let totalChange = 0;
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] && prices[i-1]) {
      const dailyChange = Math.abs((prices[i] - prices[i-1]) / prices[i-1] * 100);
      totalChange += dailyChange;
    }
  }
  
  return totalChange / (prices.length - 1);
}
