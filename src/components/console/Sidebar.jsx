import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, MapPin, FileText, Home, Menu, Settings, LogOut, House } from 'lucide-react';
import { cn } from '../../helpers/utils';
import { Button } from '../ui/button';
import PropTypes from 'prop-types';
import Cookies from "universal-cookie";

const cookies = new Cookies();
const navigation = [
  { name: 'Dashboard', href: '/dev-mode', icon: House },
  { name: 'Products', href: '/dev-mode/products', icon: Package },
  { name: 'Locations', href: '/dev-mode/locations', icon: MapPin },
  { name: 'Listings', href: '/dev-mode/listings', icon: FileText },
];
const extras = [
  { name: 'Settings', href: '#', icon: Settings },
  { name: 'Logout', href: '/', icon: LogOut },
];


export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex h-screen flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo and Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className={cn(
            "flex items-center space-x-2 transition-opacity duration-300",
            isCollapsed ? "hidden" : "flex"
          )}>
            <Home className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Admin Console</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className='flex-1 flex flex-col justify-between'>
            <nav className="flex-1 space-y-1 px-2 py-6">
                {navigation.map((item) => (<SideNavButton key={item.name} item={item} isCollapsed={isCollapsed} />))}
            </nav>
            <nav className='space-y-1 px-2 py-6'>
                {extras.map((item) => (<SideNavButton key={item.name} item={item} isCollapsed={isCollapsed} />))}
            </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex justify-around py-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors min-w-0',
                  isActive
                    ? 'text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1 flex-shrink-0',
                    isActive ? 'text-blue-500' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function SideNavButton({ item, isCollapsed }) {
  const navigate = useNavigate();
  const isActive = location.pathname === item.href;

  const logout = () => {
    cookies.remove("TOKEN", { path: "/" });
    window.location.href = "/";
  };

  if (item.name === "Logout") {
    return (
      <button
        className={cn(
          "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
          isCollapsed ? "justify-center" : ""
        )}
        type="button"
        onClick={logout}
        title={isCollapsed ? item.name : undefined}
      >
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            isActive
              ? "text-blue-500"
              : "text-gray-400 group-hover:text-gray-500",
            isCollapsed ? "" : "mr-3"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "transition-opacity duration-300 whitespace-nowrap",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}
        >
          {item.name}
        </span>
      </button>
    );
  }

  return (
    <Link
      key={item.name}
      to={item.href}
      className={cn(
        "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
        isCollapsed ? "justify-center" : ""
      )}
      title={isCollapsed ? item.name : undefined}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive
            ? "text-blue-500"
            : "text-gray-400 group-hover:text-gray-500",
          isCollapsed ? "" : "mr-3"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "transition-opacity duration-300 whitespace-nowrap",
          isCollapsed ? "opacity-0 w-0" : "opacity-100"
        )}
      >
        {item.name}
      </span>
    </Link>
  );
}
SideNavButton.propTypes = {
    item: PropTypes.object,
    isCollapsed: PropTypes.bool,
}
