import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, ChevronUp } from 'lucide-react'
import { RatingSystem } from '../components/Product/RatingSystem'
import { ReviewCard } from '../components/Product/ReviewCard'
import { fetchProduct, fetchReviews, voteProduct, fetchUserVote, submitReview } from '../lib/ProductClient'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import type { Product, Review, VoteState } from '../types'
import { Avatar } from '../components/common/Avatar'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { language } = useLanguage()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [voteState, setVoteState] = useState<VoteState>({ voted: false, votesCount: 0 })
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [prod, revs] = await Promise.all([
          fetchProduct(id),
          fetchReviews(id),
        ])

        if (cancelled) return

        if (!prod) {
          setProduct(null)
          setError('not_found')
        } else {
          setProduct(prod)
          setVoteState({ voted: prod.votes > 0, votesCount: prod.votes })
        }
        setReviews(revs)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load product:', err)
        setError('load_error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!id || !user) return
    let cancelled = false

    const loadVote = async () => {
      try {
        const userVote = await fetchUserVote(id, user.id)
        if (cancelled) return
        setVoteState(prev => ({ ...prev, voted: userVote === 'up' }))
      } catch {
        // ignore
      }
    }

    loadVote()

    return () => {
      cancelled = true
    }
  }, [id, user])

  const handleVote = async () => {
    if (!user || !product || voting) return

    setVoting(true)
    setVoteError(null)
    try {
      const result = await voteProduct(product.id, user.id)
      setVoteState(result)
      const updated = await fetchProduct(product.id)
      if (updated) setProduct(updated)
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Vote failed. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (error === 'not_found' || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
          <p className="text-slate-400 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/products" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  if (error === 'load_error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-slate-400 mb-6">Failed to load product details. Please try again later.</p>
          <Link to="/products" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const title = language === 'am' && product.titleAm ? product.titleAm : product.title
  const description = language === 'am' && product.descriptionAm ? product.descriptionAm : product.description
  const gallery = product.galleryUrls?.length ? product.galleryUrls : [product.image]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <img
                src={product.image}
                alt={title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                    <p className="text-slate-300 text-lg leading-relaxed">{description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="bg-slate-700 text-slate-200 text-sm font-medium px-3 py-1 rounded-full border border-slate-600">
                    {product.category}
                  </span>
                  {product.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full border border-cyan-500/30"
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {product.galleryUrls.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-200 mb-3">Gallery</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {gallery.map((src: string, idx: number) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`${title} ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-700"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={product.user?.avatar}
                      name={product.user?.name}
                      size={48}
                      className="w-12 h-12 rounded-full border border-slate-600"
                    />
                    <div>
                      <h3 className="font-medium text-white">{product.user?.name}</h3>
                      <p className="text-sm text-slate-400">Creator</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <RatingSystem
              productId={product.id}
              currentRating={product.rating || 0}
              reviewCount={product.reviewCount || 0}
              onRatingSubmit={async (rating, comment) => {
                if (!user) return
                await submitReview(product.id, user.id, rating, comment)
                const updated = await fetchReviews(product.id)
                setReviews(updated)
                const refreshed = await fetchProduct(product.id)
                if (refreshed) setProduct(refreshed)
              }}
            />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: Review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
                  <p className="text-slate-400">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vote for this product</h3>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleVote}
                  disabled={!user || voting}
                  className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                    voteState.voted
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : user
                      ? 'bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronUp className="w-6 h-6" />
                  <span className="text-sm font-medium mt-1">Upvote</span>
                </button>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{voteState.votesCount}</div>
                  <div className="text-sm text-slate-400">votes</div>
                </div>
              </div>
              {!user && (
                <p className="text-xs text-slate-400 text-center mt-3">Sign in to vote</p>
              )}
              {voteError && (
                <p className="text-xs text-red-400 text-center mt-3">{voteError}</p>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
              <div className="space-y-3">
                {product.website && (
                  <a
                    href={product.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Visit Website</span>
                  </a>
                )}
                {product.github && (
                  <a
                    href={product.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Github className="w-5 h-5 text-slate-300" />
                    <span className="text-white">View on GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {product.status === 'funding' && product.fundingGoal > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Funding Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Raised: ${product.currentFunding.toLocaleString()}</span>
                    <span className="text-slate-300">Goal: ${product.fundingGoal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all shadow-lg"
                      style={{ width: `${Math.min((product.currentFunding / product.fundingGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-white">
                      {Math.round((product.currentFunding / product.fundingGoal) * 100)}%
                    </span>
                    <p className="text-sm text-slate-400">funded</p>
                  </div>
                  <Link
                    to={`/pledge/${product.id}`}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg block text-center"
                  >
                    Support This Project
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Join the Team</h3>
              <p className="text-slate-300 mb-4">
                Interested in collaborating on this project? Join the team and help bring this innovation to life.
              </p>
              <Link
                to={`/collaborate/${product.id}`}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg block text-center"
              >
                Request to Collaborate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
