import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { Plus, LogOut } from 'lucide-react';

export default function Header({ title, actionLabel, onAction, onLogout }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your {title.toLowerCase()} and their settings
        </p>
      </div>
      { onAction &&
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 md:mr-2" />
          <span className='hidden md:inline'>{actionLabel}</span>
        </Button>
      }
      { onLogout &&
        <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white">
          <LogOut className='h-4 w-4 md:mr-2' />
          <span className='hidden md:inline'>{actionLabel}</span>
        </Button>
      }
    </div>
  );
}

Header.displayName = "Header"
Header.propTypes = {
    title: PropTypes.string.isRequired,
    actionLabel : PropTypes.string.isRequired,
    onAction: PropTypes.func,
}
