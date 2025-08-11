import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Check, Sparkles, Zap, Crown } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  const plans = [
    {
      id: 'individual',
      name: 'Individual',
      price: '$5',
      period: 'per story',
      features: [
        'Pay as you go',
        'High-quality personalized stories',
        'Character-consistent illustrations',
        'Download and share stories',
        'No subscription required'
      ],
      icon: Sparkles,
      color: 'from-blue-400 to-blue-600',
      buttonText: 'Get Started'
    },
    {
      id: 'plus',
      name: 'Plus',
      price: '$10',
      period: 'per month',
      features: [
        'Up to 10 stories per month',
        'All Individual features',
        'Priority story generation',
        'Story history and favorites',
        'Cancel anytime'
      ],
      icon: Zap,
      color: 'from-purple-400 to-purple-600',
      buttonText: 'Subscribe',
      recommended: true
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$30',
      period: 'per month',
      features: [
        'Unlimited stories',
        'All Plus features',
        'Advanced customization options',
        'Premium illustrations',
        'Priority support'
      ],
      icon: Crown,
      color: 'from-yellow-400 to-orange-500',
      buttonText: 'Go Unlimited'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const data = await subscriptionAPI.getUsageStats();
      setUsage(data);
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutUrl = await subscriptionAPI.createCheckout(
        planId,
        `${window.location.origin}/checkout/success`,
        `${window.location.origin}/subscription`
      );
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const portalUrl = await subscriptionAPI.getPortalUrl(
        `${window.location.origin}/subscription`
      );
      window.location.href = portalUrl;
    } catch (err) {
      setError(err.message || 'Failed to open customer portal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600">
          Create magical, personalized stories for your sunshine
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Current Subscription Status */}
      {user && usage && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-2">Your Current Plan</h3>
          <p className="text-2xl font-bold text-purple-600 mb-1">
            {usage.subscription_type || 'Free'}
          </p>
          {usage.subscription_type !== 'free' && (
            <>
              <p className="text-sm text-gray-600 mb-3">
                {usage.stories_generated}/{usage.stories_limit || '∞'} stories this month
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                Manage Subscription
              </button>
            </>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
              plan.recommended ? 'ring-2 ring-purple-400 transform scale-105' : ''
            }`}
          >
            {plan.recommended && (
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                RECOMMENDED
              </div>
            )}
            
            <div className="p-8">
              <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-white mb-4`}>
                <plan.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || (usage && usage.subscription_type === plan.id)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  usage && usage.subscription_type === plan.id
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                }`}
              >
                {usage && usage.subscription_type === plan.id
                  ? 'Current Plan'
                  : loading
                  ? 'Processing...'
                  : plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Yes! All subscriptions can be cancelled at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">How do the story limits work?</h3>
            <p className="text-gray-600">
              Individual plans are pay-per-story. Plus plans include 10 stories per month. Unlimited plans have no limits on story generation.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Can I switch plans?</h3>
            <p className="text-gray-600">
              Absolutely! You can upgrade or downgrade your plan at any time through the customer portal.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Is my payment information secure?</h3>
            <p className="text-gray-600">
              Yes, all payments are processed securely through Stripe. We never store your credit card information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;