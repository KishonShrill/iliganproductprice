import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Shield } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-12 pb-16 bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-gradient-to-r from-[#ee4d2d]/10 to-orange-100 px-4 py-2 rounded-full text-[#ee4d2d] font-medium text-sm mb-6 hover:scale-105 transition-transform duration-300">
              <Shield className="w-4 h-4 mr-2" />
              100% Free • Non-Profit Initiative
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Shop Smarter,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]">
                Spend Less
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Track your shopping cart total in real-time before checkout. Budget Buddy helps you make informed decisions and stick to your budget effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/locations" className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25 group">
                Start Budgeting Now
                <ShoppingCart className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
      {/* <button className="border-2 border-[#ee4d2d] text-[#ee4d2d] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#ee4d2d] hover:text-white transition-all duration-300 hover:scale-105">
                Watch Demo
              </button> */}
            </div>
            
            {/* Stats
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
              {[
                { number: '50K+', label: 'Happy Users' },
                { number: '$2M+', label: 'Money Saved' },
                { number: '4.9★', label: 'User Rating' }
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-[#ee4d2d] transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div> */}
          </div>
          
          {/* Right Content - Mockup */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between text-white mb-4">
                  <h3 className="text-lg font-semibold">Shopping Cart</h3>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-white">₱127.50</div>
                <div className="text-orange-100 text-sm">Budget: ₱150.00</div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Catsan Light Cat Litter 3L', price: '₱159.8' },
                  { name: 'Slurpee Large', price: '₱40' },
                  { name: 'Ottogi Cheese Ramen Pouch 111g', price: '₱89' },
                  { name: 'Century Tuna Flakes in Oil 180g', price: '₱52' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-[#ee4d2d]">{item.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800 font-medium">✓ Under Budget!</div>
                <div className="text-green-600 text-sm">You have ₱22.50 remaining</div>
              </div>
            </div>
            
            {/* Background Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-[#ee4d2d]/20 to-orange-200/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-br from-orange-200/20 to-[#ee4d2d]/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
