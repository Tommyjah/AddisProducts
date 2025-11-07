import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageCircle, Users, ExternalLink, Github, DollarSign, Star } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onVote?: (productId: string) => void;
}

export function ProductCard({ product, onVote }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [voteType, setVoteType] = useState<'up' | 'down' | null>(null);
  const [localVotes, setLocalVotes] = useState(product.votes);

  const handleVote = (type: 'up' | 'down') => {
    if (!user) return;
    
    if (voteType === type) {
      // Remove vote
      setLocalVotes(prev => type === 'up' ? prev - 1 : prev + 1);
      setVoteType(null);
    } else {
      // Add or change vote
      const change = voteType === null 
        ? (type === 'up' ? 1 : -1)
        : (type === 'up' ? 2 : -2);
      setLocalVotes(prev => prev + change);
      setVoteType(type);
      onVote?.(product.id);
    }
  };

  const title = language === 'am' && product.titleAm ? product.titleAm : product.title;
  const description = language === 'am' && product.descriptionAm ? product.descriptionAm : product.description;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg border border-slate-700 hover:shadow-xl hover:border-cyan-500/50 transition-all duration-300 group overflow-hidden">
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        {product.isFeatured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
            Featured
          </div>
        )}
        {product.status === 'funding' && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
            Funding
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link
              to={`/products/${product.id}`}
              className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors line-clamp-1"
            >
              {title}
            </Link>
            <p className="text-sm text-slate-300 mt-1 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Vote Buttons */}
          <div className="ml-4 flex flex-col items-center space-y-1">
            <button
              onClick={() => handleVote('up')}
              disabled={!user}
              className={`p-1 rounded-lg transition-all ${
                voteType === 'up'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : user
                  ? 'bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-white px-2 py-1 bg-slate-700 rounded-full min-w-[2rem] text-center">
              {localVotes}
            </span>
            <button
              onClick={() => handleVote('down')}
              disabled={!user}
              className={`p-1 rounded-lg transition-all ${
                voteType === 'down'
                  ? 'bg-red-500 text-white shadow-lg'
                  : user
                  ? 'bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-slate-300">
            {product.rating.toFixed(1)} ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Category and Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1 rounded-full border border-slate-600">
            {product.category}
          </span>
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-xs font-medium px-3 py-1 rounded-full border border-cyan-500/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Funding Progress */}
        {product.status === 'funding' && product.fundingGoal && product.currentFunding !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
              <span className="text-slate-300">{t('product.raised')}: ${product.currentFunding.toLocaleString()}</span>
              <span className="text-slate-300">{t('product.goal')}: ${product.fundingGoal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all shadow-lg"
                style={{ width: `${Math.min((product.currentFunding / product.fundingGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={product.user.avatar}
              alt={product.user.name}
              className="w-6 h-6 rounded-full border border-slate-600"
            />
            <span className="text-sm text-slate-300">{product.user.name}</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Collaborators */}
            {product.collaborators.length > 1 && (
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Users className="w-3 h-3" />
                <span>{product.collaborators.length}</span>
              </div>
            )}

            {/* Links */}
            <div className="flex items-center space-x-2">
              {product.github && (
                <a
                  href={`https://github.com/${product.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {product.website && (
                <a
                  href={product.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
          <Link
            to={`/products/${product.id}`}
            className="flex items-center space-x-1 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('product.comments')}</span>
          </Link>

          <div className="flex items-center space-x-2">
            {product.status === 'funding' && (
              <Link
                to={`/pledge/${product.id}`}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-3 py-1 rounded-lg text-sm font-medium transition-all shadow-lg"
              >
                <DollarSign className="w-3 h-3 inline mr-1" />
                Pledge
              </Link>
            )}
            <Link
              to={`/collaborate/${product.id}`}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 px-3 py-1 rounded-lg text-sm font-medium transition-all shadow-lg"
            >
              {t('product.collaborate')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}