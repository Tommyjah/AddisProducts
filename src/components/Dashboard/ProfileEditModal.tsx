import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types';
import { Avatar } from '../common/Avatar';
import { uploadAvatar } from '../../lib/ProductClient';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: user?.name || '',
    avatar_url: user?.avatar || '',
    bio: user?.bio || '',
    github_username: user?.github || '',
    twitter_username: user?.twitter || '',
    website_url: user?.website || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const url = await uploadAvatar(file, user.id);
      setFormData(prev => ({ ...prev, avatar_url: url }));
    } catch (err) {
      setError(err instanceof Error ? `Upload failed: ${err.message}` : 'Failed to upload avatar. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await updateProfile(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? `Update failed: ${err.message}` : 'Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={formData.avatar_url}
                  name={formData.full_name || user?.name || 'User'}
                  size={80}
                  className="w-20 h-20 rounded-full border-2 border-slate-300 object-cover"
                />
                <label className={`absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-600 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-600">Upload a new avatar image</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio ?? ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Website</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url ?? ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">GitHub Username</label>
              <input
                type="text"
                name="github_username"
                value={formData.github_username ?? ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Twitter Username</label>
              <input
                type="text"
                name="twitter_username"
                value={formData.twitter_username ?? ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                placeholder="username"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
