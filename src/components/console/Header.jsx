import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export default function Header({ title, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your {title.toLowerCase()} and their settings
        </p>
      </div>
      <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}

Header.displayName = "Header"
Header.propTypes = {
    title: PropTypes.string.isRequired,
    actionLabel : PropTypes.string.isRequired,
    onAction: PropTypes.func,
}
