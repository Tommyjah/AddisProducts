import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Users, Calendar, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import { mockProducts, mockReviews } from '../data/mockData';
import { RatingSystem } from '../components/Product/RatingSystem';
import { ReviewCard } from '../components/Product/ReviewCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function ProductDetail() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [voteType, setVoteType] = useState<'up' | 'down' | null>(null);
  const [localVotes, setLocalVotes] = useState(0);

  const product = mockProducts.find(p => p.id === id);
  const reviews = mockReviews.filter(r => r.productId === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
          <Link to="/products" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    setLocalVotes(product.votes);
  }, [product.votes]);

  const handleVote = (type: 'up' | 'down') => {
    if (!user) return;
    
    if (voteType === type) {
      setLocalVotes(prev => type === 'up' ? prev - 1 : prev + 1);
      setVoteType(null);
    } else {
      const change = voteType === null 
        ? (type === 'up' ? 1 : -1)
        : (type === 'up' ? 2 : -2);
      setLocalVotes(prev => prev + change);
      setVoteType(type);
    }
  };

  const title = language === 'am' && product.titleAm ? product.titleAm : product.title;
  const description = language === 'am' && product.descriptionAm ? product.descriptionAm : product.description;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Header */}
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

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="bg-slate-700 text-slate-200 text-sm font-medium px-3 py-1 rounded-full border border-slate-600">
                    {product.category}
                  </span>
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full border border-cyan-500/30"
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* User Info */}
                <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.user.avatar}
                      alt={product.user.name}
                      className="w-12 h-12 rounded-full border border-slate-600"
                    />
                    <div>
                      <h3 className="font-medium text-white">{product.user.name}</h3>
                      <p className="text-sm text-slate-400">Creator</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{product.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating System */}
            <RatingSystem
              productId={product.id}
              currentRating={product.rating}
              reviewCount={product.reviewCount}
            />

            {/* Reviews */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vote for this product</h3>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user}
                  className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                    voteType === 'up'
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
                  <div className="text-2xl font-bold text-white">{localVotes}</div>
                  <div className="text-sm text-slate-400">votes</div>
                </div>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user}
                  className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                    voteType === 'down'
                      ? 'bg-red-500 text-white shadow-lg'
                      : user
                      ? 'bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronDown className="w-6 h-6" />
                  <span className="text-sm font-medium mt-1">Downvote</span>
                </button>
              </div>
            </div>

            {/* Links */}
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
                    href={`https://github.com/${product.github}`}
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

            {/* Collaborators */}
            {product.collaborators.length > 1 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  <Users className="w-5 h-5 inline mr-2" />
                  Collaborators
                </h3>
                <div className="space-y-3">
                  {product.collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center space-x-3">
                      <img
                        src={collaborator.avatar}
                        alt={collaborator.name}
                        className="w-8 h-8 rounded-full border border-slate-600"
                      />
                      <span className="text-slate-300">{collaborator.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funding Progress */}
            {product.status === 'funding' && product.fundingGoal && product.currentFunding !== undefined && (
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

            {/* Collaborate Button */}
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
  );
}