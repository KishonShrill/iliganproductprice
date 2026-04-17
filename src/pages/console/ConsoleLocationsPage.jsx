import { useNavigate } from 'react-router-dom';
import Header from '@/components/console/Header';
import DataTable from '@/components/DataTable';
import useFetchLocations from '@/hooks/useFetchLocations';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const columns = [
    { key: 'name', label: 'Location Name', sortable: true },
    { key: 'address', label: 'Address' },
    { key: 'store_hours', label: 'Store Hours' },
    { key: 'open_24_hrs', label: '24 Hours', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'actions', label: 'Actions' },
];

const cookies = new Cookies();

export default function Locations() {
    const navigate = useNavigate();
    const { isLoading, data } = useFetchLocations()

    const token = cookies.get("budgetbuddy_token");
    const decodedUser = token ? jwtDecode(token) : null;

    const normalizedData = data?.map(item => ({
        _id: item._id,
        name: item.location_name,
        address: `${item.address.street}, ${item.address.barangay}, ${item.address.city}`,
        map: item.coordinates,
        store_hours: `${item.store_hours.open} - ${item.store_hours.close}`,
        open_24_hrs: item.is_open_24hrs,
        type: item.type
    }))

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        navigate("/");
    };

    const handleView = (location) => {
        window.open(location.map, '_blank').focus();
    };

    return (
        <>
            <title>BB:Console - Locations</title>
            <div className="flex-1 overflow-auto bg-gray-50">
                <Header
                    title="Locations"
                    actionLabel="Add Location"
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8 h-[calc(100vh-120px)] overflow-y-auto">
                    {isLoading
                        ? <h1>Loading...</h1>
                        : <DataTable
                            fetched={"locations"}
                            data={normalizedData}
                            columns={columns}
                            filterableColumns={['status', 'type']}
                            onView={handleView}
                        />
                    }
                </div>
            </div>
        </>
    );
}
