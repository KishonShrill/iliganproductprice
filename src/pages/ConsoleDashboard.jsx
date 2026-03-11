import Header from '../components/console/Header';
import Cookies from 'universal-cookie';

const cookies = new Cookies()


export default function Products() {
    const logout = () => {
        cookies.remove("TOKEN", { path: "/" });
        window.location.href = "/";
    };

    return (
        <>
            <title>BB:Console - Dashboard</title>
            <div className="flex-1 overflow-auto bg-gray-50 min-w-[320px]">
                <Header
                    title="Dashboard"
                    actionLabel="Logout"
                    onLogout={logout}
                />
                <div className="p-4 md:p-8">

                </div>
            </div>
        </>
    );
}
