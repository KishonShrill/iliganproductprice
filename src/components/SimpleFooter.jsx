import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const SimpleFooter = ({ className }) => {
    const navigate = useNavigate();
    return (
        <footer className={`mt-3 border-t border-gray-200 p-8 text-center text-sm text-gray-500 ${className}`}>
            <p>© 2026 Budget Buddy. All rights reserved.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
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
                <button
                    onClick={() => navigate('/report')}
                    className="font-medium hover:text-orange-500 hover:underline"
                >
                    Report Missing Data
                </button>
            </div>
        </footer>
    );
}

SimpleFooter.propTypes = {
    className: PropTypes.string
}

export default SimpleFooter;
