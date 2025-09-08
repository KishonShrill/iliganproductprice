import { Link } from 'react-router-dom';
import { Plus, Calculator, CheckCircle, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Plus,
      title: 'Add Products',
      description: 'Simply add items to your Budget Buddy cart as you browse online stores.',
      details: 'Copy and paste product names and prices, or use our browser extension for automatic detection.'
    },
    {
      icon: Calculator,
      title: 'Track Your Total',
      description: 'Watch your running total update in real-time with tax and shipping estimates.',
      details: 'Set your budget limit and get visual indicators when you\'re approaching your spending goal.'
    },
    {
      icon: CheckCircle,
      title: 'Shop Confidently',
      description: 'Make informed decisions and checkout knowing exactly what you\'ll spend.',
      details: 'Get alerts if you go over budget and suggestions for staying within your limits.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Budget Buddy{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in three simple steps and take control of your shopping budget today.
          </p>
        </div>

        {/* Steps */}
        <div className="relative px-4">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="w-1/3 h-0.5 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]"></div>
              <div className="w-1/3 h-0.5 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] rounded-full flex items-center justify-center text-white font-bold text-sm z-10 group-hover:scale-125 transition-transform duration-300">
                  {index + 1}
                </div>

                {/* Card */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-[#ee4d2d]/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#ee4d2d] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.details}
                  </p>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-8">
                      <ArrowRight className="w-6 h-6 text-[#ee4d2d]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-20 bg-gradient-to-br from-[#ee4d2d]/5 to-orange-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              See It In Action
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch how Budget Buddy helps you stay on track with your shopping goals in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Demo Interface */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Shopping Cart</h4>
                <div className="text-sm text-gray-500">Budget: ₱200</div>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  { item: 'Lettuce', price: 45.99 },
                  { item: 'Ginger', price: 19.99 },
                  { item: 'Eggplant', price: 34.99 }
                ].map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{product.item}</span>
                    <span className="font-semibold text-[#ee4d2d]">₱{product.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-[#ee4d2d]">₱100.97</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] h-2 rounded-full" style={{width: '50.5%'}}></div>
                </div>
                <div className="text-sm text-gray-600 mt-2">₱99.03 remaining in budget</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {[
                { title: 'Never Overspend Again', desc: 'Real-time alerts keep you within budget' },
                { title: 'Smart Recommendations', desc: 'Get suggestions to optimize your cart' },
                { title: 'Multiple Store Support', desc: 'Works with all major online retailers' }
              ].splice(1).map((benefit, idx) => (
                <div key={idx} className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 group-hover:text-[#ee4d2d] transition-colors duration-300">
                      {benefit.title}
                    </h5>
                    <p className="text-gray-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10 mb-4">
            <Link to="/locations" className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[#ee4d2d]/25">
              Try Budget Buddy Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
