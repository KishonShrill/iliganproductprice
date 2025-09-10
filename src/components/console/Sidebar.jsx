import { Link, useLocation } from 'react-router-dom';
import { Package, MapPin, FileText, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Products', href: '/dev-mode/products', icon: Package },
  { name: 'Locations', href: '/dev-mode/locations', icon: MapPin },
  { name: 'Listings', href: '/dev-mode/listings', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Admin Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
