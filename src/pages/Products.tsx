import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { ProductCard } from '../components/Product/ProductCard'
import { CategoryFilter } from '../components/Product/CategoryFilter'
import { fetchProducts } from '../lib/ProductClient'
import { useLanguage } from '../contexts/LanguageContext'

export function Products() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('votes')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  const searchQuery = searchParams.get('search') || ''
  useEffect(() => {
    if (searchQuery) setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter by search
  let filtered = products
  if (localSearchQuery || searchQuery) {
    const q = (localSearchQuery || searchQuery).toLowerCase()
    filtered = products.filter(product =>
      product.title?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q) ||
      product.tags?.some(t => t.toLowerCase().includes(q)) ||
      product.user?.name?.toLowerCase().includes(q)
    )
  }

  // Filter by category
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(p =>
      p.category?.toLowerCase().includes(selectedCategory)
    )
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return (b.votes || 0) - (a.votes || 0)
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'funding':
        return (b.currentFunding || 0) - (a.currentFunding || 0)
      default:
        return 0
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearchQuery.trim()) {
      setSearchParams({ search: localSearchQuery.trim() })
    } else {
      setSearchParams({})
    }
  }

  const clearSearch = () => {
    setLocalSearchQuery('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('nav.products')}</h1>
          <p className="text-slate-300">
            Discover amazing products built by Ethiopian developers and startups
          </p>
          {(searchQuery || localSearchQuery) && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-slate-300">
                  Search results for: <span className="text-cyan-400 font-semibold">"{searchQuery || localSearchQuery}"</span>
                </p>
                <button onClick={clearSearch} className="text-slate-400 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, tags, categories, or creators..."
                value={localSearchQuery}
                onChange={e => setLocalSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 pr-4 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-lg"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              {localSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-200 mb-3">Categories</h3>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            <div className="lg:ml-6">
              <label className="text-sm font-medium text-slate-200 block mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              >
                <option value="votes">Most Voted</option>
                <option value="recent">Most Recent</option>
                <option value="funding">Highest Funding</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-slate-300">
            Showing {loading ? '...' : sorted.length} product{sorted.length !== 1 ? 's' : ''}
            {(searchQuery || localSearchQuery) && <span> matching "{searchQuery || localSearchQuery}"</span>}
            {selectedCategory !== 'all' && <span> in {t(`category.${selectedCategory}`)}</span>}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse">
                <div className="h-48 bg-slate-700 rounded-t-xl"></div>
                <div className="pt-4 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">
              {localSearchQuery || searchQuery
                ? `No products found matching "${localSearchQuery || searchQuery}"`
                : 'No products found in this category.'}
            </div>
            <div className="mt-4 space-x-4">
              {(localSearchQuery || searchQuery) && (
                <button onClick={clearSearch} className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Clear search
                </button>
              )}
              {selectedCategory !== 'all' && (
                <button onClick={() => setSelectedCategory('all')} className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Show all products
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
