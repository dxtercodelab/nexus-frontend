import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, 
  Sparkles, LogOut, Sun, Moon, Menu, X 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Produits', icon: Package },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/orders', label: 'Commandes', icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* Header mobile (visible seulement sur mobile) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center glow-blue">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Nexus</h1>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Overlay mobile (fond noir quand sidebar ouverte) */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-72 glass flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center glow-blue">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nexus</h1>
              <p className="text-xs text-gray-400">Management Suite</p>
            </div>
          </div>
          {/* Bouton fermer sur mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs uppercase text-gray-500 font-semibold px-4 mb-2 tracking-wider">
            Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'gradient-blue text-white glow-blue font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                    <span className="text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bouton Theme + User + Déconnexion */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {/* Toggle Theme */}
          <button
            onClick={toggleTheme}
            className="w-full glass glass-hover rounded-xl p-3 flex items-center gap-3 transition group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isDark 
                ? 'bg-yellow-500/10 text-yellow-400' 
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">
                Mode {isDark ? 'Clair' : 'Sombre'}
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all relative ${
              isDark ? 'bg-blue-500/20' : 'bg-yellow-500/20'
            }`}>
              <div 
                className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${
                  isDark 
                    ? 'left-0.5 bg-blue-500' 
                    : 'left-5 bg-yellow-500'
                }`}
              />
            </div>
          </button>

          {/* User Info */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;