'use client';
import { useSession, signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import StockAnalyzer from './components/StockAnalyzer';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Smart Stock Analyzer</h1>
        <p className="text-lg text-gray-600 mb-6">
          Analyze stocks with AI-powered insights and build your portfolio
        </p>
        {!session && (
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 mb-8">
            <p className="text-gray-700 mb-2">
              Sign in to save stocks to your portfolio and track their performance over time.
            </p>
              <button
                onClick={() => signIn('google')}
                className="btn-primary"
              >
                Sign In
              </button>
          </div>
        )}
      </div>
      
      <StockAnalyzer />
    </div>
  );
}
