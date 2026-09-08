import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    priceMonthly: 'Free',
    priceYearly: 'Free',
    description: 'For developers getting started',
    features: [
      'List 1 product',
      'Basic product page',
      'Receive votes and pledges',
      'Basic analytics (total votes + views)',
      'Appear in normal listings',
      'Community support',
    ],
    limitations: [
      'Only 1 active product',
      'No verified badge',
      'Lower ranking priority',
      'No advanced analytics',
      'Cannot run featured campaigns',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Maker Pro',
    priceMonthly: '799 ETB',
    priceYearly: '7,999 ETB',
    description: 'For serious Ethiopian makers',
    features: [
      'Unlimited products',
      'Verified badge',
      'Advanced analytics (views, votes over time, traffic sources)',
      'Priority placement in search results',
      'Ability to offer rewards to backers',
      'Direct access to submit for Featured Products',
      'Early access to new platform features',
      'Priority support',
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    popular: true,
  },
]

const featuredPlans = [
  { duration: '7 days', price: '2,000 ETB', placement: 'Homepage + Top of Products page', note: 'Good entry option' },
  { duration: '14 days', price: '3,500 ETB', placement: 'Homepage + Top of Products page', note: 'Best value' },
  { duration: '30 days', price: '6,000 ETB', placement: 'Homepage + Top of Products + Badge', note: 'Most popular' },
  { duration: '30 days Premium', price: '9,000 ETB', placement: 'Everything above + Newsletter mention', note: 'Higher visibility' },
]

export function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Pricing
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Free to list. Pay to grow. Designed for Ethiopian developers and startups.
          </p>
        </div>

        {/* Maker Plans */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Maker Plans</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            List your products for free. Upgrade to reach more people and unlock powerful tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative bg-slate-800 rounded-2xl border-2 p-8 transition-all ${
                  plan.popular ? 'border-cyan-500 shadow-xl shadow-cyan-500/10' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{plan.priceMonthly}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  {plan.priceYearly !== plan.priceMonthly && (
                    <p className="text-sm text-slate-400">or {plan.priceYearly}/year</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center space-x-3 text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.limitations.map(limitation => (
                      <li key={limitation} className="flex items-center space-x-3 text-slate-500">
                        <X className="w-5 h-5 flex-shrink-0" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 shadow-lg'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Featured Products</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Promote your product to the top of the homepage and products page. Pay once, get visibility for days.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Product Promotion</h3>
                <div className="space-y-4">
                  {featuredPlans.map((plan, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        i === 2 ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${i === 2 ? 'text-cyan-300' : 'text-slate-300'}`}>{plan.duration}</span>
                          {i === 2 && <span className="text-xs bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full">Best Value</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{plan.placement}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{plan.price}</div>
                        <p className="text-xs text-slate-400">{plan.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 border-t border-slate-700 bg-slate-900">
                <p className="text-sm text-slate-400 text-center mb-4">
                  Payments via Chapa or Telebirr. Contact us to feature your product.
                </p>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Questions?</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'Is it really free to list a product?', a: 'Yes. The Starter plan lets you list 1 product with a full product page, votes, pledges, and basic analytics — completely free.' },
              { q: 'What payment methods do you accept?', a: 'We accept Chapa and Telebirr for local Ethiopian payments. International payments available soon.' },
              { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.' },
              { q: 'How does Featured Products work?', a: 'When you purchase a featured slot, your product appears at the top of the homepage and products page with a special badge for the duration you selected. No recurring charges.' },
              { q: 'What if I\'m not sure which plan to choose?', a: 'Start with free. Once you have 100+ votes or want to list multiple products, consider upgrading to Maker Pro.' },
            ].map((item, i) => (
              <details key={i} className="bg-slate-800 rounded-lg border border-slate-700 open:border-cyan-500/50">
                <summary className="px-6 py-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  {item.q}
                  <span className="text-slate-400 text-sm">▼</span>
                </summary>
                <div className="px-6 pb-4 text-slate-300 text-sm leading-relaxed border-t border-slate-700 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl p-12 text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-cyan-100 mb-8 max-w-xl mx-auto">
            Join hundreds of Ethiopian developers already showcasing their products on Addis Product.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium hover:bg-slate-100 transition-all shadow-lg">
              Create Free Account
            </a>
            <a href="/submit" className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-all">
              Submit a Product
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
