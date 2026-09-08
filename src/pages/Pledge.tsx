import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, DollarSign, CreditCard, Wallet, Shield, Users, Target, TrendingUp, Heart, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchProduct, createPledge, fetchPledges } from '../lib/ProductClient'
import type { Product, Pledge } from '../types'

export function Pledge() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [loading, setLoading] = useState(true)
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  useEffect(() => {
    if (id) {
      Promise.all([fetchProduct(id), fetchPledges(id)])
        .then(([prod, pld]) => {
          setProduct(prod)
          setPledges(pld)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-300 mb-6">You need to be logged in to pledge to projects.</p>
          <Link to="/login" className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg">
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
          <Link to="/products" className="text-cyan-400 hover:text-cyan-300">← Back to Products</Link>
        </div>
      </div>
    )
  }

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !pledgeAmount || parseFloat(pledgeAmount) <= 0) return

    setIsProcessing(true)
    setSubmitMsg('')
    try {
      await createPledge(product.id, user.id, parseFloat(pledgeAmount), message || undefined)
      setSubmitMsg(`Successfully pledged $${pledgeAmount} to ${product.title}!`)
      setPledgeAmount('')
      setMessage('')
      // Refresh
      const [updatedProduct, updatedPledges] = await Promise.all([
        fetchProduct(product.id),
        fetchPledges(product.id),
      ])
      setProduct(updatedProduct)
      setPledges(updatedPledges)
    } catch (err: unknown) {
      setSubmitMsg(err instanceof Error ? err.message : 'Failed to process pledge. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const fundingProgress = product.fundingGoal ? (product.currentFunding / product.fundingGoal) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/products/${product.id}`} className="inline-flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
                <p className="text-slate-300 mb-4">{product.description}</p>
                <div className="flex items-center space-x-3 mb-4">
                  <img src={product.user?.avatar || ''} alt={product.user?.name} className="w-10 h-10 rounded-full border border-slate-600" />
                  <div>
                    <h3 className="font-medium text-white">{product.user?.name}</h3>
                    <p className="text-sm text-slate-400">Project Creator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4"><Target className="w-5 h-5 inline mr-2" /> Funding Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Raised: ${product.currentFunding?.toLocaleString() || '0'}</span>
                  <span className="text-slate-300">Goal: ${product.fundingGoal?.toLocaleString() || '0'}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all shadow-lg"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }} />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-emerald-400">{Math.round(fundingProgress)}%</span>
                  <p className="text-sm text-slate-400">funded</p>
                </div>
              </div>
            </div>

            {/* Recent Pledgers */}
            {pledges.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4"><Users className="w-5 h-5 inline mr-2" /> Recent Supporters ({pledges.length})</h3>
                <div className="space-y-3">
                    {pledges.slice(0, 5).map(p => (
                     <div key={p.id} className="flex items-center space-x-3">
                       <img src={p.user?.avatar || ''} alt={p.user?.name} className="w-8 h-8 rounded-full border border-slate-600" />
                       <div className="flex-1">
                         <p className="text-sm text-white">{p.user?.name || 'Anonymous'}</p>
                         <p className="text-xs text-slate-400">${p.amount}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Why Support */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4"><Heart className="w-5 h-5 inline mr-2" /> Why Support This Project?</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3"><Star className="w-5 h-5 text-yellow-400 mt-0.5" /><span className="text-slate-300">Support Ethiopian innovation and technology</span></li>
                <li className="flex items-start space-x-3"><Users className="w-5 h-5 text-cyan-400 mt-0.5" /><span className="text-slate-300">Help local developers bring their ideas to life</span></li>
                <li className="flex items-start space-x-3"><TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5" /><span className="text-slate-300">Contribute to Ethiopia's growing tech ecosystem</span></li>
              </ul>
            </div>
          </div>

          {/* Pledge Form */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6"><DollarSign className="w-6 h-6 inline mr-2" /> Make a Pledge</h2>
              {submitMsg && (
                <div className={`mb-4 p-4 rounded-lg ${submitMsg.includes('Successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <p className={submitMsg.includes('Successfully') ? 'text-green-300' : 'text-red-300'}>{submitMsg}</p>
                </div>
              )}
              <form onSubmit={handlePledge} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Pledge Amount (USD) *</label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input type="number" required min="1" step="0.01" value={pledgeAmount}
                      onChange={e => setPledgeAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="25.00" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map(a => (
                    <button key={a} type="button" onClick={() => setPledgeAmount(a.toString())}
                      className="py-2 px-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                      ${a}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                      <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'}
                        onChange={e => setPaymentMethod(e.target.value)} className="text-cyan-600 focus:ring-cyan-500" />
                      <CreditCard className="w-5 h-5 text-slate-300" />
                      <span className="text-slate-200">Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                      <input type="radio" name="paymentMethod" value="mobile" checked={paymentMethod === 'mobile'}
                        onChange={e => setPaymentMethod(e.target.value)} className="text-cyan-600 focus:ring-cyan-500" />
                      <Wallet className="w-5 h-5 text-slate-300" />
                      <span className="text-slate-200">Mobile Money</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Message (Optional)</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="Leave an encouraging message for the creator..." />
                </div>
                <button type="submit" disabled={isProcessing || !pledgeAmount}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 shadow-lg">
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : `Pledge $${pledgeAmount || '0'}`}
                </button>
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4"><Shield className="w-5 h-5 inline mr-2" /> Secure Payment</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center space-x-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span>SSL encrypted transactions</span></li>
                <li className="flex items-center space-x-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span>Your payment information is secure</span></li>
                <li className="flex items-center space-x-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span>Support Ethiopian innovation</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
