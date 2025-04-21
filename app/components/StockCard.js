'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function StockCard({ stock, onUpdate }) {
  const [quantity, setQuantity] = useState(stock.quantity);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const gainLoss = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
  const gainLossPercent = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;

  const handleUpdateQuantity = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity: Number(quantity),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stock.symbol,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link href={`/?symbol=${stock.symbol}`} className="text-xl font-bold text-primary hover:underline">
            {stock.symbol}
          </Link>
          <div className="text-gray-500 text-sm">Added: {new Date(stock.addedAt).toLocaleDateString()}</div>
        </div>
        <div className={`text-lg font-semibold ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {gainLoss >= 0 ? '▲' : '▼'} ${Math.abs(gainLoss).toFixed(2)} ({gainLossPercent.toFixed(2)}%)
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-gray-600 text-sm">Current Price</div>
          <div className="font-medium">${stock.currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600 text-sm">Purchase Price</div>
          <div className="font-medium">${stock.purchasePrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600 text-sm">Quantity</div>
          {isEditing ? (
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 px-2 py-1 border rounded-md"
            />
          ) : (
            <div className="font-medium">{stock.quantity}</div>
          )}
        </div>
        <div>
          <div className="text-gray-600 text-sm">Total Value</div>
          <div className="font-medium">${(stock.currentPrice * stock.quantity).toFixed(2)}</div>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleUpdateQuantity}
              disabled={isLoading}
              className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setQuantity(stock.quantity);
              }}
              disabled={isLoading}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
          >
            Edit Quantity
          </button>
        )}
        <button
          onClick={handleRemove}
          disabled={isLoading}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
        >
          {isLoading ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
