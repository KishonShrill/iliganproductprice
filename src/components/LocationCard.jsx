import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import StoreLogo from './StoreLogo.jsx'

const LocationCard = React.memo(({ item }) => (
    <Link className="location-container" to={`/location/${item._id}`}
        data-location-id={item._id}
        data-location-name={item.location_name}
        data-location-type={item.type}
        data-location-24h={item.is_open_24hrs}
    >
        <div>
            <StoreLogo storeName={item.location_name} />
        </div>
        <div>
            <p className="location__details">{item.location_name}</p>
            <p className="location__details">{item.type}</p>
        </div>
    </Link>
));

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

export default React.memo(LocationCard);