import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Review } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { user } = useAuth();
  const [helpful, setHelpful] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (!user || hasVoted) return;
    setHelpful(prev => prev + 1);
    setHasVoted(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-slate-600'
        }`}
      />
    ));
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={review.user.avatar}
            alt={review.user.name}
            className="w-10 h-10 rounded-full border border-slate-600"
          />
          <div>
            <h4 className="font-medium text-white">{review.user.name}</h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-slate-400">
                {review.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-slate-300 mb-4 leading-relaxed">{review.comment}</p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleHelpful}
          disabled={!user || hasVoted}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all ${
            hasVoted
              ? 'bg-cyan-500/20 text-cyan-400 cursor-not-allowed'
              : user
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-cyan-400'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
          <span>Helpful ({helpful})</span>
        </button>
      </div>
    </div>
  );
}