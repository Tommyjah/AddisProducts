import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createProduct } from '../lib/ProductClient'

export function Submit() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    titleAm: '',
    description: '',
    descriptionAm: '',
    category: '',
    tags: [] as string[],
    website: '',
    github: '',
    image: '',
    fundingGoal: '',
    isFunding: false,
    timeline: '',
    teamSize: '1',
    currentStage: 'idea',
    targetAudience: '',
    businessModel: '',
    launchDate: '',
    socialLinks: { twitter: '', linkedin: '', telegram: '', youtube: '' },
  })

  const categories = [
    'Mobile App', 'Web Application', 'AI/ML', 'Blockchain', 'FinTech',
    'HealthTech', 'EdTech', 'AgTech', 'E-commerce', 'SaaS', 'Gaming', 'IoT', 'DevTools', 'Other',
  ]

  const stages = [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'mvp', label: 'MVP' },
    { value: 'beta', label: 'Beta Testing' },
    { value: 'launched', label: 'Launched' },
    { value: 'scaling', label: 'Scaling' },
  ]

  const businessModels = [
    'Freemium', 'Subscription', 'One-time Purchase', 'Advertising',
    'Commission', 'Enterprise', 'Open Source', 'Non-profit', 'Other',
  ]

  if (!user) {
    navigate('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setForm(prev => ({ ...prev, [parent]: { ...prev[parent as keyof typeof prev], [child]: value } }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const addTag = () => {
    const tagInput = document.getElementById('tagInput') as HTMLInputElement
    if (tagInput && tagInput.value.trim() && !form.tags.includes(tagInput.value.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.value.trim()] }))
      tagInput.value = ''
    }
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.category) { setError('Category is required'); return }

    setSubmitting(true)
    try {
      await createProduct(
        {
          title: form.title,
          title_am: form.titleAm || null,
          description: form.description,
          description_am: form.descriptionAm || null,
          image_url: form.image || null,
          website_url: form.website || null,
          github_url: form.github || null,
          category: form.category,
          tags: form.tags.length > 0 ? form.tags : null,
          funding_goal: form.isFunding ? parseFloat(form.fundingGoal) || 0 : null,
          status: form.isFunding ? 'funding' : 'active',
          government_only: false,
        },
        user.id
      )
      setSubmitted(true)
    } catch (err: any) {
      console.error('Submit failed:', err)
      setError(err.message || 'Failed to submit product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Product Submitted!</h1>
          <p className="text-slate-300 mb-8">Your product is now live on Addis Product.</p>
          <div className="space-x-4">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setForm({ title: '', titleAm: '', description: '', descriptionAm: '', category: '', tags: [], website: '', github: '', image: '', fundingGoal: '', isFunding: false, timeline: '', teamSize: '1', currentStage: 'idea', targetAudience: '', businessModel: '', launchDate: '', socialLinks: { twitter: '', linkedin: '', telegram: '', youtube: '' } }); }}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/products')}
              className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all border border-slate-600"
            >
              View Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Submit Your Product
          </h1>
          <p className="text-slate-300 text-lg">Share your innovation with the Ethiopian tech community</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s <= step ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>{s}</div>
              {s < 3 && <div className={`w-12 h-1 mx-2 ${s < step ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Project Title (English) *</label>
                  <input type="text" name="title" required value={form.title} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="Enter your project title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Project Title (Amharic)</label>
                  <input type="text" name="titleAm" value={form.titleAm} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="የፕሮጀክት ስም" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Description (English) *</label>
                  <textarea name="description" required value={form.description} onChange={handleChange} rows={5}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="Describe your project, its purpose, and key features" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Description (Amharic)</label>
                  <textarea name="descriptionAm" value={form.descriptionAm} onChange={handleChange} rows={5}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="የፕሮጀክት መግለጫ" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Category *</label>
                  <select name="category" required value={form.category} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Current Stage *</label>
                  <select name="currentStage" required value={form.currentStage} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
                    {stages.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Team Size</label>
                  <input type="number" name="teamSize" min="1" max="100" value={form.teamSize} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Target Audience</label>
                <input type="text" name="targetAudience" value={form.targetAudience} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="Who is your target audience? (e.g., Small businesses, Students, Farmers)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Tags</label>
                <div className="flex gap-2">
                  <input id="tagInput" type="text" value=""
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="Add a tag..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                  <button type="button" onClick={addTag}
                    className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">Add</button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-sm px-3 py-1 rounded-full">
                        {t} <button type="button" onClick={() => removeTag(t)} className="text-cyan-400 hover:text-cyan-200">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Links & Media */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Links & Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Website URL</label>
                  <input type="url" name="website" value={form.website} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">GitHub Repository</label>
                  <input type="text" name="github" value={form.github} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="username/repo" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Product Image URL</label>
                <input type="url" name="image" value={form.image} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="https://images.pexels.com/..." />
                <p className="text-xs text-slate-400 mt-1">Paste an image URL (from Pexels, Unsplash, etc.)</p>
              </div>
            </div>
          )}

          {/* Step 3: Funding (optional) */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Funding (Optional)</h2>
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                <input type="checkbox" id="isFunding" checked={form.isFunding} onChange={handleChange}
                  className="text-cyan-500 focus:ring-cyan-500" />
                <label htmlFor="isFunding" className="text-slate-200 cursor-pointer">Enable funding for this product</label>
              </div>
              {form.isFunding && (
                <div className="space-y-4 pl-6 border-l-2 border-cyan-500/30">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Funding Goal (USD)</label>
                    <input type="number" name="fundingGoal" min="1" value={form.fundingGoal} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Timeline</label>
                    <input type="text" name="timeline" value={form.timeline} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="e.g., 6 months" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Business Model</label>
                  <select name="businessModel" value={form.businessModel} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
                    <option value="">Select...</option>
                    {businessModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Launch Date</label>
                  <input type="date" name="launchDate" value={form.launchDate} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700 mt-8">
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <div className="flex items-center space-x-4">
              <button type="button" onClick={() => navigate('/products')}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg">
                  Next Step
                </button>
              ) : (
                <button type="submit" disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg font-semibold">
                  {submitting ? 'Submitting...' : 'Submit Product'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
