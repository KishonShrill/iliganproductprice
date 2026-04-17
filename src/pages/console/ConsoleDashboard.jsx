import { useNavigate } from 'react-router-dom';
import Header from '@/components/console/Header';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const cookies = new Cookies()


export default function Products() {
    const navigate = useNavigate();
    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        navigate("/");
    };
    const token = cookies.get("budgetbuddy_token");
    const decodedUser = token ? jwtDecode(token) : null;

    return (
        <>
            <title>BB:Console - Dashboard</title>
            <div className="flex-1 overflow-auto bg-gray-50 h-full min-w-[320px]">
                <Header
                    title="Dashboard"
                    actionLabel="Logout"
                    onLogout={logout}
                    user={decodedUser}
                />
                <div className="p-4 md:p-8 h-[calc(100vh-120px)] overflow-y-auto">

                </div>
            </div>
        </>
    );
}
