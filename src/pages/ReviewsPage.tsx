import React, { useState, useEffect } from 'react';
import { Star, Send, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import api from '../services/api';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setMessage({ type: 'error', text: 'Name and comment are required.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/reviews', { name, rating, comment });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Thank you! Your review has been submitted.' });
        setName('');
        setRating(5);
        setComment('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0A315C] mb-4">Customer Reviews</h1>
          <p className="text-slate-600 font-medium">Read what our members have to say about our cooperative services, or leave your own feedback.</p>
        </div>

        {/* Submit Review Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8 mb-12">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <Star className="h-5 w-5 text-[#ED7F1E] fill-current" />
            <span>Leave a Review</span>
          </h3>

          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-start space-x-3 text-sm font-semibold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A315C] focus:ring-1 focus:ring-[#0A315C] outline-none transition-colors text-sm"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`h-8 w-8 ${rating >= star ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Review</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A315C] focus:ring-1 focus:ring-[#0A315C] outline-none transition-colors text-sm resize-none"
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              {!isSubmitting && <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Display Reviews */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Reviews</h3>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
              <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{review.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${review.rating >= star ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
