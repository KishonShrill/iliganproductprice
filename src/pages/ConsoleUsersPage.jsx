import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Shield, ShieldAlert, User, Loader2, Mail, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

import Header from '../components/console/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { jwtDecode } from 'jwt-decode';

const cookies = new Cookies();
const DEVELOPMENT = import.meta.env.VITE_DEVELOPMENT === "true";
const API_VERSION = import.meta.env.VITE_API_VERSION;
const LOCALHOST = import.meta.env.VITE_LOCALHOST;

// Automatically handles the relative path routing for Vercel vs Localhost
// const API_URL = `/api/${API_VERSION}/users`;

// 1. Define the strict hierarchy weights
const ROLE_WEIGHTS = {
    admin: 10,
    moderator: 5,
    regular: 1
};

export default function ConsoleUsersPage() {
    const navigate = useNavigate();
    const cookie = cookies.get("budgetbuddy_token")
    const currentUser = jwtDecode(cookie)
    const queryClient = useQueryClient();
    const { addToast } = useOutletContext();

    // console.log(currentUser)
    // --- NEW: SEARCH & PAGINATION STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset to page 1 whenever the user searches or changes the items per page
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    const logout = () => {
        cookies.remove("budgetbuddy_token", { path: "/" });
        queryClient.invalidateQueries('pendingContributions_User');
        navigate("/");
    };

    // --- DATA FETCHING ---
    const { data: users = [], isLoading } = useQuery('console_users', async () => {
        const response = await axios.get(DEVELOPMENT
            ? `http://${LOCALHOST}:5000/api/${API_VERSION}/users`
            : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/users`,
            {
                headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
            });
        return response.data.users || response.data;
    });

    // --- MUTATION FOR CHANGING ROLES ---
    const updateRoleMutation = useMutation(
        ({ userId, newRole }) => {
            return ResultAsync.fromPromise(
                axios.put(DEVELOPMENT
                    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/users/${userId}/role`
                    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/users/${userId}/role`
                    , { role: newRole }, {
                    headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
                }),
                (error) => error.response?.data?.message || "Failed to update user role."
            );
        },
        {
            onSuccess: (result) => {
                result.match(
                    (res) => {
                        addToast("Success", "User role updated successfully!");
                        queryClient.invalidateQueries('console_users');
                    },
                    (errMessage) => {
                        addToast("Error", errMessage, "destructive");
                    }
                );
            }
        }
    );

    // --- MUTATION: DELETE USER ---
    const deleteUserMutation = useMutation(
        (userId) => {
            return ResultAsync.fromPromise(
                axios.delete(DEVELOPMENT
                    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/users/${userId}`
                    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/users${userId}`
                    , {
                        headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` }
                    }),
                (error) => error.response?.data?.message || "Failed to delete user."
            );
        },
        {
            onSuccess: (result) => {
                result.match(
                    (res) => {
                        addToast("Deleted", res.data?.message || "User permanently removed.");
                        queryClient.invalidateQueries('console_users');
                    },
                    (errMessage) => addToast("Error", errMessage, "destructive")
                );
            }
        }
    );

    // --- STRICT RBAC LOGIC HELPERS ---
    const canManageUser = (targetRole, targetId) => {
        if (targetId === currentUser.user_id) return false; // Can't change your own role
        return ROLE_WEIGHTS[currentUser.user_role] > ROLE_WEIGHTS[targetRole];
    };

    const getAssignableRoles = () => {
        // You can only assign roles that have a strictly LOWER weight than your own
        return Object.keys(ROLE_WEIGHTS).filter(
            (role) => ROLE_WEIGHTS[role] < ROLE_WEIGHTS[currentUser.user_role]
        );
    };

    const assignableRoles = getAssignableRoles();

    const filteredUsers = users
        .filter(user =>
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (a._id === currentUser.user_id) return -1; // Move 'a' up if it's you
            if (b._id === currentUser.user_id) return 1;  // Move 'b' up if it's you
            return 0; // Keep everyone else in their original order
        });

    // 2. Calculate pagination slices
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <>
            <Header
                title="User Management"
                subtitle="Manage clearance levels and platform access."
                onLogout={logout}
                user={currentUser}
            />
            <div className="p-4 md:p-8 max-w-6xl mx-auto">

                {/* SEARCH BAR */}
                <div className="relative w-full md:w-80 mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white focus-visible:ring-orange-500"
                    />
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                        <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-500" />
                            Registered Users ({users.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {currentUsers.map((user) => {
                                const isManageable = canManageUser(user.role, user._id);
                                //console.log(user)

                                return (
                                    <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">

                                        {/* User Info */}
                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                {user.role === 'admin' ? <ShieldAlert className="text-orange-600 h-6 w-6" /> :
                                                    user.role === 'moderator' ? <Shield className="text-orange-500 h-6 w-6" /> :
                                                        <User className="text-gray-500 h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 capitalize">{user.username.toLowerCase()}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions Container */}
                                        <div className="flex items-center gap-3">
                                            {/* Role Dropdown */}
                                            <div className="w-40 sm:w-48">
                                                <Select
                                                    disabled={!isManageable || updateRoleMutation.isLoading}
                                                    value={user.role}
                                                    onValueChange={(newRole) => {
                                                        if (newRole !== user.role) {
                                                            updateRoleMutation.mutate({ userId: user._id, newRole });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className={`w-full ${!isManageable ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-orange-400 focus:ring-orange-500'}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-white'>
                                                        <SelectItem value={user.role} className="capitalize font-medium">
                                                            {user.role}
                                                        </SelectItem>
                                                        {isManageable && assignableRoles.map((role) => (
                                                            role !== user.role && (
                                                                <SelectItem key={role} value={role} className="capitalize bg-white hover:bg-gray-100 cursor-pointer">
                                                                    {role}
                                                                </SelectItem>
                                                            )
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Delete Button (Admins Only) */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 transition-colors"
                                                disabled={deleteUserMutation.isLoading || ROLE_WEIGHTS[user.role] >= ROLE_WEIGHTS[currentUser.user_role]}
                                                onClick={() => {
                                                    if (window.confirm(`WARNING: Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`)) {
                                                        deleteUserMutation.mutate(user._id);
                                                    }
                                                }}
                                                title="Delete User"
                                            >
                                                {deleteUserMutation.isLoading && deleteUserMutation.variables === user._id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    {searchQuery ? `No users found matching "${searchQuery}"` : "No users found in the database."}
                                </div>
                            )}
                        </div>

                        {/* PAGINATION FOOTER - Only renders if there are more than 10 users */}
                        {filteredUsers.length > 10 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-gray-50/80 gap-4 sm:gap-0">

                                {/* Items Per Page */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Show</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(v) => setItemsPerPage(Number(v))}
                                    >
                                        <SelectTrigger className="w-[70px] h-8 bg-white focus:ring-orange-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span>entries</span>
                                </div>

                                {/* Page Controls */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div >
        </>
    );
}

// Just a quick icon helper for the header
function Users(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
