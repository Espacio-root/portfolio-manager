'use client';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-semibold text-primary">
            Smart Stock Analyzer
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`text-gray-600 hover:text-primary transition-colors ${
                pathname === '/' ? 'text-primary font-medium' : ''
              }`}
            >
              Home
            </Link>
            
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-gray-600 hover:text-primary transition-colors ${
                    pathname === '/dashboard' ? 'text-primary font-medium' : ''
                  }`}
                >
                  My Portfolio
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    {session.user.name}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="btn-primary"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
