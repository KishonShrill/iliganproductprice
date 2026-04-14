import { Link, useLocation } from "react-router-dom";
import { ReceiptText, Settings, UtensilsCrossed, ShoppingBasket } from "lucide-react";
import { cn } from "../helpers/utils";

const navigation = [
    { name: 'Groceries', href: '/locations', icon: ShoppingBasket },
    { name: 'Cuisines', href: '#', icon: UtensilsCrossed, disabled: true },
    { name: 'Receipt', href: '/receipt', icon: ReceiptText },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const BottomNavigation = () => {
    const webLocation = useLocation()
    if ('/' === webLocation.pathname
        || '/authenticate' === webLocation.pathname
        || '/profile' === webLocation.pathname) return null

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <nav className="flex flex-1 justify-between">
                    {navigation.map((item) => {
                        const isActive = webLocation.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    `flex flex-col items-center px-3 py-4 text-xs font-medium transition-colors min-w-0 grow ${item.disabled && 'bg-red-100 pointer-events-none'}`,
                                    isActive
                                        ? 'text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                )
                                }
                            >
                                <item.icon
                                    className={cn(
                                        'h-5 w-5 mb-1 flex-shrink-0',
                                        isActive ? 'text-blue-500' : !item.disabled ? 'text-gray-400' : 'text-white'
                                    )}
                                    aria-hidden="true"
                                />
                                <span className={`truncate ${item.disabled && 'text-white select-none'}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div >
        </>
    )
}

export default BottomNavigation
