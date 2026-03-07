import React from "react";
import PropTypes from "prop-types";
import { Store } from "lucide-react";
import { Link } from "react-router-dom";

import StoreLogo from './StoreLogo.jsx'

const storeImages = {
    'gaisano': '/images/logos/gaisano-logo.jpg',
    '7-eleven': '/images/logos/7-eleven_logo.svg',
    'shoppe 24': '/images/logos/shoppe24-logo.webp',
    // Add more mappings as needed
}

const LocationCard = React.memo(({ item }) => {
    const shortName = item.location_name.split(' - ')[1] || item.location_name;

    const lowerName = item.location_name.toLowerCase()
    const match = Object.keys(storeImages).find(key => lowerName.includes(key))

    if (!match) return null // or return a default icon

    return (
        <Link className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" to={`/location/${item._id}`}
            data-location-id={item._id}
            data-location-name={item.location_name}
            data-location-type={item.type}
            data-location-24h={item.is_open_24hrs}
        >
            {/* Aspect-video ensures the top logo area is always the same proportion */}
            <div className="relative flex aspect-video w-full items-center justify-center bg-gray-50 p-6 overflow-hidden">
                {/* We use object-contain so logos never squish, even if they are weird shapes */}
                <img
                    src={storeImages[match]}
                    alt={`${match} logo`}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=Store+Logo'; }}
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
                <h3 className="text-lg font-bold text-gray-800">{shortName}</h3>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                    <Store size={14} />
                    {item.type}
                </span>
            </div>
        </Link>
    );
});

// ✅ Display name for React DevTools
LocationCard.displayName = "LocationCard";

// ✅ PropTypes validation
LocationCard.propTypes = {
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        location_name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        is_open_24hrs: PropTypes.string,
    }).isRequired,
};

export default LocationCard;
