import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileBarChart,
  Menu,
  X,
  LogOut,
  Fingerprint,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from '../utils/clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: ClipboardList },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const closeSidebar = () => setSidebarOpen(false);

  // Check if user is primary admin from token
  const authToken = localStorage.getItem('token');
  let isPrimaryAdmin = false;
  if (authToken) {
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      isPrimaryAdmin = payload.role === 'primary_admin';
    } catch (e) {
      // Invalid token
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-gray-900">Attendance</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
          
          {/* Admin only section */}
          {isPrimaryAdmin && (
            <div className="pt-4 mt-4 border-t">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
              <NavLink
                to="/users"
                onClick={closeSidebar}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors mt-2',
                  location.pathname.startsWith('/users')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <UserCog className="h-5 w-5" />
                Users
              </NavLink>
            </div>
          )}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-4 lg:ml-0 text-lg font-semibold text-gray-900">
            {navItems.find((item) => location.pathname.startsWith(item.path))
              ?.label || 'Dashboard'}
          </h1>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
