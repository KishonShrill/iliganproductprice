import { CheckCircle, XCircle, Award, User, ArrowLeft, Clock, LogOut } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { useQueryClient } from "react-query";

const cookies = new Cookies();

const ProfilePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const cookie = cookies.get("budgetbuddy_token");
    const user = cookie ? jwtDecode(cookie) : { username: "Guest", user_role: "guest" };

    const profile = {
        stats: {
            points: 0,
            approved: 0,
            pending: 0,
            rejected: 0
        }
    }

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries('pendingContributions_User');
        navigate("/");
        window.location.reload(); // Ensures state clears
    };

    console.log()

    return (
        < div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-4xl flex-col p-4 sm:p-6 lg:p-10" >
            <div className="flex justify-between">
                <button
                    onClick={logout}
                    className="mb-6 flex items-center gap-2 rounded-full px-4 py-2 text-white text-sm font-semibold bg-red-700 hover:bg-red-400"
                >
                    <LogOut size={20} />Logout
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <ArrowLeft size={16} />Go Back?
                </button>
            </div>

            <div className="flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm relative">
                {/* Profile Header */}
                <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-100 shadow-xl">
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                        <User size={48} className="text-orange-500" />
                    )}
                </div>

                <h2 className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-black text-gray-900 text-center capitalize">{user.username.toLowerCase()}</h2>
                <p className="text-sm sm:text-base text-gray-500 text-center">{user.user_email}</p>
                <span className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
                    {user.user_role}
                </span>

                {/* Stats Section */}
                <div className="mt-8 sm:mt-10 w-full border-t border-gray-100 pt-8 sm:pt-10">
                    <h3 className="mb-6 text-center text-lg sm:text-xl font-bold text-gray-800">Your Contributions</h3>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-6">

                        {/* Points Card */}
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 sm:p-6 text-white shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-1">
                            <Award size={28} className="mb-2 opacity-80 sm:h-8 sm:w-8" />
                            <span className="text-3xl sm:text-4xl font-black">{profile.stats.points}</span>
                            <span className="mt-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90">Points</span>
                        </div>

                        {/* Approved Card */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                            <div className="mb-2 sm:mb-3 rounded-full bg-green-100 p-2 text-green-500">
                                <CheckCircle size={20} className="sm:h-6 sm:w-6" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-gray-800">{profile.stats.approved}</span>
                            <span className="mt-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Approved</span>
                            <p className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[10px] leading-tight text-gray-400 hidden sm:block">Items validated by admin</p>
                        </div>

                        {/* Pending Card */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                            <div className="mb-2 sm:mb-3 rounded-full bg-yellow-100 p-2 text-yellow-500">
                                <Clock size={20} className="sm:h-6 sm:w-6" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-gray-800">{profile.stats.pending}</span>
                            <span className="mt-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending</span>
                            <p className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[10px] leading-tight text-gray-400 hidden sm:block">Awaiting review</p>
                        </div>

                        {/* Rejected Card */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                            <div className="mb-2 sm:mb-3 rounded-full bg-red-100 p-2 text-red-500">
                                <XCircle size={20} className="sm:h-6 sm:w-6" />
                            </div>
                            <span className="text-2xl sm:text-3xl font-black text-gray-800">{profile.stats.rejected}</span>
                            <span className="mt-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Rejected</span>
                            <p className="mt-1 sm:mt-2 text-center text-[9px] sm:text-[10px] leading-tight text-gray-400 hidden sm:block">Data declined</p>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
export default ProfilePage;
