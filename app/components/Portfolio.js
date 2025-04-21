'use client';
import { useEffect, useState } from 'react';
import StockCard from './StockCard';

export default function Portfolio({ portfolio, onUpdate }) {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [gainLoss, setGainLoss] = useState(0);
  const [gainLossPercent, setGainLossPercent] = useState(0);

  useEffect(() => {
    calculatePortfolioStats();
  }, [portfolio]);

  const calculatePortfolioStats = () => {
    if (!portfolio || portfolio.length === 0) return;

    const totalCurrent = portfolio.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
    const totalInitial = portfolio.reduce((sum, stock) => sum + (stock.purchasePrice * stock.quantity), 0);
    const totalGainLoss = totalCurrent - totalInitial;
    const gainLossPercent = (totalGainLoss / totalInitial) * 100;

    setPortfolioValue(totalCurrent);
    setGainLoss(totalGainLoss);
    setGainLossPercent(gainLossPercent);
  };

  return (
    <div>
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-gray-600 mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold text-primary">${portfolioValue.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 mb-1">Total Gain/Loss</div>
            <div className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${gainLoss.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 mb-1">Percent Change</div>
            <div className={`text-2xl font-bold ${gainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {gainLossPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolio.map((stock) => (
          <StockCard 
            key={stock.symbol} 
            stock={stock} 
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
