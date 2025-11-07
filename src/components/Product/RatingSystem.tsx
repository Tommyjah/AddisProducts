import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RatingSystemProps {
  productId: string;
  currentRating: number;
  reviewCount: number;
  onRatingSubmit?: (rating: number, comment: string) => void;
}

export function RatingSystem({ productId, currentRating, reviewCount, onRatingSubmit }: RatingSystemProps) {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedRating === 0) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onRatingSubmit?.(selectedRating, comment);
    setShowReviewForm(false);
    setSelectedRating(0);
    setComment('');
    setIsSubmitting(false);
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < (interactive ? (hoverRating || selectedRating) : rating)
            ? 'text-yellow-400 fill-current'
            : 'text-slate-600 hover:text-yellow-400'
        }`}
        onClick={interactive ? () => setSelectedRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      {/* Current Rating Display */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              {renderStars(currentRating)}
            </div>
            <span className="text-2xl font-bold text-white">{currentRating.toFixed(1)}</span>
          </div>
          <p className="text-slate-400 text-sm">Based on {reviewCount} reviews</p>
        </div>
        
        {user && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2 mb-6">
        {[5, 4, 3, 2, 1].map((stars) => {
          const percentage = Math.random() * 100; // Mock data
          return (
            <div key={stars} className="flex items-center space-x-3">
              <span className="text-sm text-slate-400 w-8">{stars}★</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-slate-400 w-12">{Math.round(percentage)}%</span>
            </div>
          );
        })}
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <form onSubmit={handleSubmitReview} className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
          
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Your Rating
            </label>
            <div className="flex items-center space-x-1">
              {renderStars(selectedRating, true)}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              placeholder="Share your experience with this product..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={selectedRating === 0 || isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setSelectedRating(0);
                setComment('');
              }}
              className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!user && (
        <div className="text-center py-4 border-t border-slate-700">
          <p className="text-slate-400 mb-2">Sign in to write a review</p>
          <button className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}