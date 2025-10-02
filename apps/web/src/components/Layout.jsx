import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Header */}
      <header className="bg-ink-950 text-paper-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">Reading Tracker</span>
            </NavLink>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-ink-800 text-white' 
                      : 'text-ink-300 hover:text-white hover:bg-ink-900'
                  }`
                }
              >
                Reading List
              </NavLink>
              <NavLink
                to="/items/new"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-ink-800 text-white' 
                      : 'text-ink-300 hover:text-white hover:bg-ink-900'
                  }`
                }
              >
                Add Item
              </NavLink>
              <NavLink
                to="/tags"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-ink-800 text-white' 
                      : 'text-ink-300 hover:text-white hover:bg-ink-900'
                  }`
                }
              >
                Tags
              </NavLink>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink-400">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-ink-300 hover:text-white hover:bg-ink-900 rounded-lg transition-all"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

