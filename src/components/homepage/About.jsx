import React from 'react';
import { Heart, Target, Globe, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Community First',
      description: 'Built by the community, for the community. Every feature is designed with user feedback and real needs in mind.'
    },
    {
      icon: Target,
      title: 'Mission Driven',
      description: 'Our goal is simple: help people make better financial decisions and reduce unnecessary spending.'
    },
    {
      icon: Globe,
      title: 'Accessible to All',
      description: 'Completely free and accessible worldwide. No premium features, no hidden costs, just helpful tools.'
    },
    {
      icon: Award,
      title: 'Trusted Solution',
      description: 'Thousands of users trust Budget Buddy to help them stay within their shopping budgets every day.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center bg-gradient-to-r from-[#ee4d2d]/10 to-orange-100 px-4 py-2 rounded-full text-[#ee4d2d] font-medium text-sm mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Non-Profit Initiative
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Empowering Smart{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47]">
                Financial Decisions
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Budget Buddy was born from a simple observation: too many people overspend while shopping online because they lose track of their cart total. We created a free, easy-to-use tool that helps you stay aware of your spending in real-time.
            </p>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              As a non-profit initiative, we're committed to keeping Budget Buddy completely free and accessible to everyone. Our mission is to promote financial wellness and help people make more informed purchasing decisions.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">100% Free Forever</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Privacy Focused</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Open Source</span>
              </div>
            </div>
          </div>

          {/* Right Content - Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className={`w-12 h-12 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#ee4d2d] transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
      {/* <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Making a Real Impact
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how Budget Buddy is helping people around the world make better financial decisions every day.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '50,000+', label: 'Active Users', sublabel: 'Growing daily' },
              { number: '$2.1M', label: 'Money Saved', sublabel: 'By our community' },
              { number: '95%', label: 'Success Rate', sublabel: 'Stay under budget' },
              { number: '4.9/5', label: 'User Rating', sublabel: 'App store reviews' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default About;
