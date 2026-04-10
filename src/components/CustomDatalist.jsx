import { useMemo } from 'react';
import PropTypes from "prop-types";


export default function CustomDatalist({ id, items, inputValue }) {

    const limitedItems = useMemo(() => {
        if (!items || items.length === 0) return [];

        // 1. Filter items based on what the user is typing
        const lowerInput = (inputValue || '').toLowerCase();
        const matchingItems = items.filter(item =>
            (item.product_name || '').toLowerCase().includes(lowerInput)
        );

        // 2. Sort the matches (Category first, then Name)
        const sortedItems = matchingItems.sort((a, b) => {
            const catA = a.category?.name || "General";
            const catB = b.category?.name || "General";

            if (catA < catB) return -1;
            if (catA > catB) return 1;

            const nameA = a.product_name || "";
            const nameB = b.product_name || "";

            return nameA.localeCompare(nameB);
        });

        // 3. Slice to keep only the top 5 results!
        return sortedItems.slice(0, 5);

    }, [items, inputValue]); // Recalculate whenever they type a new letter!

    return (
        <datalist id={id}>
            {limitedItems.map((item) => (
                <option key={item._id || item.product_id} value={item.product_name}>
                    {item.category?.name || "General"}
                </option>
            ))}
        </datalist>
    );
}

CustomDatalist.propTypes = {
    id: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    inputValue: PropTypes.string.isRequired
}
