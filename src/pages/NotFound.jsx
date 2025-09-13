import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, DollarSign } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[12rem] md:text-[16rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] leading-none animate-pulse">
            404
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 animate-bounce">
            <div className="w-8 h-8 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-full opacity-60"></div>
          </div>
          <div className="absolute top-1/3 right-1/4 transform -translate-y-1/2 animate-bounce delay-300">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-40"></div>
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-bounce delay-500">
            <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Looks like this page went over budget and disappeared!
          </p>
          <p className="text-gray-500">
            The page you&apos;,re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Budget Buddy Branding */}
        <div className="flex items-center justify-center space-x-2 mb-8 group">
          <img src="/budgetbuddy.svg" />
          <span className="text-xl font-bold text-gray-900 group-hover:text-[#ee4d2d] transition-colors duration-300">
            Budget Buddy
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25 group flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
            Go Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="border-2 border-[#ee4d2d] text-[#ee4d2d] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#ee4d2d] hover:text-white transition-all duration-300 hover:scale-105 group flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </button>
        </div>

        {/* Helpful Links
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Maybe you were looking for:
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'Features', href: '/#features', icon: Search },
              { name: 'How It Works', href: '/#how-it-works', icon: Search },
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-[#ee4d2d]/5 hover:border-[#ee4d2d]/20 border border-transparent transition-all duration-300 group"
              >
                <link.icon className="w-5 h-5 text-[#ee4d2d] mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-gray-700 group-hover:text-[#ee4d2d] transition-colors duration-300 font-medium">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div> */}

        {/* Fun Message */}
        <div className="mt-8 p-4 bg-gradient-to-r from-[#ee4d2d]/10 to-orange-100 rounded-full">
          <p className="text-[#ee4d2d] font-medium">
            💡 Pro tip: Use Budget Buddy to avoid going over budget on your shopping too!
          </p>
        </div>

        {/* Background Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#ee4d2d]/10 to-orange-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-orange-200/10 to-[#ee4d2d]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default NotFound;
