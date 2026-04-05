import { useNavigate } from "react-router-dom";
const SimpleFooter = ({ className }) => {
    const navigate = useNavigate();
    return (
        <footer className={`mt-6 border-t border-gray-200 p-8 text-center text-sm text-gray-500 ${className}`}>
            <p>© 2026 Budget Buddy. All rights reserved.</p>
            <div className="mt-3 flex justify-center gap-6">
                <button
                    onClick={() => navigate('/privacy-policy')}
                    className="font-medium hover:text-orange-500 hover:underline"
                >
                    Privacy Policy
                </button>
                <button
                    onClick={() => navigate('/terms-of-service')}
                    className="font-medium hover:text-orange-500 hover:underline"
                >
                    Terms of Service
                </button>
            </div>
        </footer>
    );
}
export default SimpleFooter;
