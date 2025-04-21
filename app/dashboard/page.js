'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Portfolio from '../components/Portfolio';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }

    if (status === 'authenticated') {
      fetchPortfolio();
    }
  }, [status]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolio');
      const data = await response.json();
      setPortfolio(data.portfolio);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-primary mb-8">My Portfolio</h1>
      
      {loading ? (
        <div className="text-center py-12">Loading your portfolio...</div>
      ) : portfolio.length > 0 ? (
        <Portfolio portfolio={portfolio} onUpdate={fetchPortfolio} />
      ) : (
        <div className="card text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 mb-4">Your portfolio is empty</h2>
          <p className="text-gray-500 mb-6">Start by adding stocks to track their performance</p>
          <Link href="/" className="btn-primary">
            Analyze Stocks
          </Link>
        </div>
      )}
    </div>
  );
}
