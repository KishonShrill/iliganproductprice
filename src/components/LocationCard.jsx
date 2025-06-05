import React from "react";
import { Link } from "react-router-dom";

const LocationCard = React.memo(({ item }) => (
    <Link className="location-container" to={`/locations/${item._id}`}
        data-location-id={item._id}
        data-location-name={item.location_name}
        data-location-type={item.type}
        data-location-24h={item.is_open_24hrs}
    >
        <div>
            <img className="location__image" src="" alt="" />
        </div>
        <div>
            <p className="location__details">{item.location_name}</p>
            <p className="location__details">{item.type}</p>
        </div>
    </Link>
));

export default React.memo(LocationCard);