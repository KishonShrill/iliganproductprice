import { Toast } from "radix-ui";
import { CheckCircle, X } from "lucide-react";
import PropTypes from "prop-types";

export default function ToastContainer({ toasts, removeToast }) {
    return (
        <Toast.Provider swipeDirection="right" duration={3000}>
            {toasts.map(toast => (
                <Toast.Root
                    key={toast.id}
                    className="ToastRoot pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-black/5"
                    open={toast.open}
                    onOpenChange={(open) => {
                        if (!open) removeToast(toast.id);
                    }}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500">
                        <CheckCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Toast.Title className="text-sm font-semibold text-gray-900 truncate">
                            {toast.name}
                        </Toast.Title>
                        <Toast.Description className="text-xs text-gray-500">
                            {toast?.description ? toast.description : 'Added to your cart'}
                        </Toast.Description>
                    </div>
                    <Toast.Action asChild altText="Close notification">
                        <button className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                            <X size={16} />
                        </button>
                    </Toast.Action>
                </Toast.Root>
            ))}

            <Toast.Viewport className="ToastViewport fixed z-[100] flex gap-3 w-full top-0 left-0 right-0 lg:top-auto lg:bottom-0 flex-col lg:flex-col-reverse items-center sm:max-w-sm sm:left-1/2 sm:-translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-0 lg:items-end lg:p-6 outline-none pointer-events-none" />
        </Toast.Provider>
    );
}

ToastContainer.propTypes = {
    toasts: PropTypes.array,
    removeToast: PropTypes.func.isRequired,
}
