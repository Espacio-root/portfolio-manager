'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Chart from 'chart.js/auto';

export default function StockAnalyzer() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [inPortfolio, setInPortfolio] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { data: session } = useSession();

  const fetchStockData = async () => {
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAnalysis(null);

      const response = await fetch(`/api/stock/${symbol.toUpperCase()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setStockData(data);
      
      // Check if stock is in portfolio
      if (session?.user) {
        const portfolioResponse = await fetch(`/api/portfolio/check?symbol=${symbol.toUpperCase()}`);
        const portfolioData = await portfolioResponse.json();
        setInPortfolio(portfolioData.inPortfolio);
      }

      // Get AI analysis
      await getAIAnalysis(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Error fetching stock data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async (data) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockData: data }),
      });
      
      const analysisData = await response.json();
      console.log('Analysis data:', analysisData); // Add this line
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      setError('Error getting AI analysis. Please try again.');
    }
  };

  const addToPortfolio = async () => {
    if (!session) {
      setError('Please sign in to add stocks to your portfolio');
      return;
    }
    
    try {
      const response = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbol: symbol.toUpperCase(),
          price: stockData.chart.result[0].indicators.quote[0].close.slice(-1)[0]
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInPortfolio(true);
      }
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      setError('Error adding stock to portfolio. Please try again.');
    }
  };

  const removeFromPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInPortfolio(false);
      }
    } catch (error) {
      console.error('Error removing stock from portfolio:', error);
      setError('Error removing stock from portfolio. Please try again.');
    }
  };

  useEffect(() => {
    if (stockData) {
      updateChart();
    }
  }, [stockData]);

  const updateChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const result = stockData.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const prices = quotes.close;

    const chartData = timestamps
      .map((time, index) => ({
        x: new Date(time * 1000).toLocaleDateString(),
        y: prices[index],
      }))
      .filter((item) => item.y !== null);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: `${symbol.toUpperCase()} Price Trend`,
            data: chartData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            type: 'category',
            grid: {
              display: false,
            },
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    });
  };

  const renderStockInfo = () => {
    if (!stockData) return null;

    const result = stockData.chart.result[0];
    const quotes = result.indicators.quote[0];
    const prices = quotes.close;
    const currentPrice = prices[prices.length - 1].toFixed(2);
    const priceChange = (prices[prices.length - 1] - prices[0]).toFixed(2);
    const priceChangePercent = ((priceChange / prices[0]) * 100).toFixed(2);
    const changeColor = priceChange >= 0 ? 'text-green-500' : 'text-red-500';

    return (
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{symbol.toUpperCase()}</h2>
        <div className="text-4xl font-bold text-primary mt-2">${currentPrice}</div>
        <div className={`text-lg font-medium ${changeColor} flex items-center justify-center mt-1`}>
          {priceChange >= 0 ? '▲' : '▼'} ${Math.abs(priceChange)} ({priceChangePercent}%)
        </div>
        
        {session && (
          <div className="mt-4">
            {inPortfolio ? (
              <button 
                onClick={removeFromPortfolio}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                Remove from Portfolio
              </button>
            ) : (
              <button 
                onClick={addToPortfolio}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
              >
                Add to Portfolio
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="input-field w-full md:w-64"
            onKeyPress={(e) => {
              if (e.key === 'Enter') fetchStockData();
            }}
          />
          <button onClick={fetchStockData} className="btn-primary">
            Analyze Stock
          </button>
        </div>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center text-primary mb-4">Loading stock data...</div>}
        
        {renderStockInfo()}
        
        <div className="h-96">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {analysis && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">AI Analysis</h2>
            <div className={`recommendation ${analysis.recommendation}`}>
              {analysis.recommendation}
            </div>
          </div>
          <div className="text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
            {analysis.analysis.split('\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-3' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
