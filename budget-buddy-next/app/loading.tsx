// budget-buddy-next/app/loading.tsx
import React from 'react';

export default function Loading(): React.JSX.Element {
    return (
        <div className='flex items-center justify-center h-full w-full'>
            <h2 className="text-lg font-medium text-gray-500">
                Loading<span className="animate-pulse">...</span>
            </h2>
        </div>
    );
}
