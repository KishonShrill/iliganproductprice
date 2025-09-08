import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import StoreLogo from './StoreLogo.jsx'

const LocationCard = React.memo(({ item }) => {
    return (
        <Link className="location-container" to={`/location/${item._id}`}
            data-location-id={item._id}
            data-location-name={item.location_name}
            data-location-type={item.type}
            data-location-24h={item.is_open_24hrs}
        >
            <div className="h-full w-full overflow-hidden">
                <StoreLogo storeName={item.location_name} />
            </div>
            <div className="px-6">
                <p className="location__details">{item.location_name.split(' - ')[1]}</p>
                <p className="location__details-tag">{item.type}</p>
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
    is_open_24hrs: PropTypes.bool,
  }).isRequired,
};

export default LocationCard;
