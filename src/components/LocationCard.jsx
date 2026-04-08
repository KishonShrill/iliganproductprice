import React from "react";
import PropTypes from "prop-types";
import { Store, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const storeImages = {
    'gaisano': '/images/logos/gaisano-logo.jpg',
    '7-eleven': '/images/logos/7-eleven_logo.svg',
    'shoppe 24': '/images/logos/shoppe24-logo.webp',
    // Add more mappings as needed
}


const LocationCard = React.memo(({ item }) => {
    const navigate = useNavigate();
    const shortName = item.location_name.split(' - ')[1] || item.location_name;
    const lowerName = item.location_name.toLowerCase()
    const match = Object.keys(storeImages).find(key => lowerName.includes(key))

    if (!match) return null // or return a default icon

    // Build a robust Google Maps search URL just in case the 'coordinates' field is a placeholder
    const buildMapUrl = () => {
        // If you ever fix the DB to have exact valid URLs, you can uncomment this:
        // if (item.coordinates && item.coordinates.includes('maps.app.goo.gl')) return item.coordinates;
        const link = item.coordinates?.link || null
        const coordinates = item.coordinates || {};
        const query = `@${coordinates.lat},${coordinates.lng},${coordinates.zoom}z`;
        return link ? link : `https://www.google.com/maps/${query}`;
    };

    const handleCardClick = () => {
        navigate(`/location/${item._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            data-location-id={item._id}
            data-location-name={item.location_name}
            data-location-type={item.type}
            data-location-24h={item.is_open_24hrs}
        >
            {/* Floating Google Maps Button 
              We use e.stopPropagation() so clicking this doesn't also trigger handleCardClick!
            */}
            <a
                href={buildMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-orange-500 hover:text-white dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-orange-500"
                title="View on Google Maps"
            >
                <MapPin size={18} />
            </a>

            {/* Logo Area */}
            <div className="relative flex aspect-video w-full items-center justify-center bg-gray-50 dark:bg-gray-700 p-6 overflow-hidden">
                <img
                    src={storeImages[match]}
                    alt={`${match} logo`}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=Store+Logo'; }}
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {/* Text Area */}
            <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-50">{shortName}</h3>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                    <Store size={14} />
                    {item.type}
                </span>
            </div>
        </div>
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
        coordinates: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
            zoom: PropTypes.number,
            link: PropTypes.string,
        }),
        is_open_24hrs: PropTypes.string,
    }).isRequired,
};

export default LocationCard;
