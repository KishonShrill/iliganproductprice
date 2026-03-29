import { useNavigate } from 'react-router-dom';
import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import { mockListings } from '../data/mockData';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'views', label: 'Views', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions' },
];

const cookies = new Cookies();

export default function Listings() {
    const navigate = useNavigate();
    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        navigate("/");
    };
    const token = cookies.get("budgetbuddy_token");
    const decodedUser = token ? jwtDecode(token) : null;
    return (
        <>
            <title>BB:Console - Listings</title>
            <div className="flex-1 overflow-auto bg-gray-50 h-full">
                <Header
                    title="Listings"
                    actionLabel="Add Listing"
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 sm:p-8">
                    <DataTable
                        data={mockListings}
                        columns={columns}
                    />
                </div>
            </div>
        </>
    );
}
