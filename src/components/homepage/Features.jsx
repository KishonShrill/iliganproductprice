import { Link } from 'react-router-dom';
import { Calculator, Bell, BarChart3, Smartphone, Clock, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Real-Time Calculations',
      description: 'See your total update instantly as you add items to your cart. No surprises at checkout.',
      color: 'from-[#ee4d2d] to-[#ff6b47]'
    },
    {
      icon: Bell,
      title: 'Budget Alerts',
      description: 'Get notified when you\'re approaching your budget limit with smart, helpful warnings.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Spending Analytics',
      description: 'Track your spending patterns and discover insights to make better financial decisions.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Use Budget Buddy on any device. Perfect for shopping on-the-go or at home.',
      color: 'from-[#ee4d2d] to-orange-500'
    },
    {
      icon: Clock,
      title: 'Quick Setup',
      description: 'Start budgeting in seconds. No complex setup or lengthy registration process required.',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Share budgets with family members and coordinate household spending together.',
      color: 'from-red-600 to-[#ee4d2d]'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]">
              Smart Shopping
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to take control of your shopping budget and make informed purchasing decisions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-[#ee4d2d]/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#ee4d2d] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Arrow */}
              <div className="mt-6 flex items-center text-[#ee4d2d] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
              {/* <span className="text-sm font-medium mr-2">Learn more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg> */}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-gradient-to-r from-[#ee4d2d]/10 to-orange-100 px-6 py-3 rounded-full">
            <span className="text-[#ee4d2d] font-medium">Ready to start saving money?</span>
            <Link to="/locations" className="ml-4 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Try Budget Buddy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
