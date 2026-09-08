import { useState, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createProduct, uploadImage } from '../lib/ProductClient'
import type { ProductInput } from '../types'

export function Submit() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState<ProductInput>({
    title: '',
    description: '',
    category: '',
    tags: [],
    websiteUrl: '',
    githubUrl: '',
    imageUrl: '',
    galleryUrls: [],
    fundingGoal: 0,
    status: 'active',
  })

  const [titleAm, setTitleAm] = useState('')
  const [descriptionAm, setDescriptionAm] = useState('')
  const [isFunding, setIsFunding] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    'Mobile App', 'Web Application', 'AI/ML', 'Blockchain', 'FinTech',
    'HealthTech', 'EdTech', 'AgTech', 'E-commerce', 'SaaS', 'Gaming', 'IoT', 'DevTools', 'Other',
  ]

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name === 'fundingGoal') {
      setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const addTag = () => {
    const tagInput = document.getElementById('tagInput') as HTMLInputElement
    const val = tagInput?.value.trim()
    if (val && !form.tags?.includes(val)) {
      setForm(prev => ({ ...prev, tags: [...(prev.tags || []), val] }))
      if (tagInput) tagInput.value = ''
    }
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) || [] }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(file, user.id)
      setForm(prev => ({ ...prev, imageUrl: url, galleryUrls: [url] }))
      setImagePreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setForm(prev => ({ ...prev, imageUrl: url, galleryUrls: url ? [url] : [] }))
    setImagePreview(url || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.category) { setError('Category is required'); return }

    setSubmitting(true)
    try {
      const input: ProductInput = {
        ...form,
        titleAm: titleAm || undefined,
        descriptionAm: descriptionAm || undefined,
        status: isFunding ? 'funding' : (form.status || 'active'),
        fundingGoal: isFunding ? (form.fundingGoal || 0) : undefined,
      }

      const product = await createProduct(input, user.id)
      navigate(`/products/${product.id}`)
    } catch (err) {
      console.error('Submit failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit product. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
                  <input type="text" value={titleAm} onChange={e => setTitleAm(e.target.value)}
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
                  <textarea value={descriptionAm} onChange={e => setDescriptionAm(e.target.value)} rows={5}
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
                  <label className="block text-sm font-medium text-slate-200 mb-2">Tags</label>
                  <div className="flex gap-2">
                    <input id="tagInput" type="text" value=""
                      className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                      placeholder="Add a tag..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                    <button type="button" onClick={addTag}
                      className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">Add</button>
                  </div>
                  {form.tags && form.tags.length > 0 && (
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Links & Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Website URL</label>
                  <input type="url" name="websiteUrl" value={form.websiteUrl} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">GitHub Repository</label>
                  <input type="text" name="githubUrl" value={form.githubUrl} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="username/repo" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Product Image</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                    />
                    {uploading && <p className="text-xs text-cyan-300 mt-2">Uploading...</p>}
                  </div>
                  <div>
                    <input type="url" value={form.imageUrl} onChange={handleUrlChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="Or paste an image URL" />
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-slate-700" />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Funding (Optional)</h2>
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                <input type="checkbox" id="isFunding" checked={isFunding} onChange={e => setIsFunding(e.target.checked)}
                  className="text-cyan-500 focus:ring-cyan-500" />
                <label htmlFor="isFunding" className="text-slate-200 cursor-pointer">Enable funding for this product</label>
              </div>
              {isFunding && (
                <div className="space-y-4 pl-6 border-l-2 border-cyan-500/30">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Funding Goal (USD)</label>
                    <input type="number" name="fundingGoal" min="1" value={form.fundingGoal || 0} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none" placeholder="50000" />
                  </div>
                </div>
              )}
            </div>
          )}

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
