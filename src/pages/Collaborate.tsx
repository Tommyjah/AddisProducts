import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Github, Linkedin, MessageCircle, Code, Palette, Megaphone, BarChart, Send, User, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  user_id: string;
  users: {
    full_name: string;
    avatar_url: string;
    bio: string;
    github_username: string;
    linkedin_url: string;
  };
}

export function Collaborate() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [availability, setAvailability] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const fetchProduct = useCallback(async () => {
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users (
            full_name,
            avatar_url,
            bio,
            github_username,
            linkedin_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const mappedProduct = {
        ...(data as Record<string, unknown>),
        image: (data as Record<string, unknown>).image_url || ''
      } as Product;

      setProduct(mappedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return
    fetchProduct()
  }, [id, fetchProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('collaborations')
        .insert({
          user_id: user.id,
          product_id: product.id,
          role: selectedRole,
          message: message,
          experience: experience,
          portfolio_url: portfolio,
          availability: availability,
          status: 'pending'
        } as never);

      if (error) throw error;

      setSubmitMessage('Collaboration request sent successfully! The project owner will review your request.');
      
      setSelectedRole('');
      setMessage('');
      setExperience('');
      setPortfolio('');
      setAvailability('');
    } catch (error) {
      console.error('Error submitting collaboration request:', error);
      setSubmitMessage('Failed to send collaboration request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center max-w-md">
          <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-300 mb-6">You need to be logged in to collaborate on projects.</p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

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

  const collaborationRoles = [
    { value: 'frontend', label: 'Frontend Developer', icon: Code, description: 'UI/UX implementation, React, Vue, Angular' },
    { value: 'backend', label: 'Backend Developer', icon: Code, description: 'Server-side logic, APIs, databases' },
    { value: 'fullstack', label: 'Full Stack Developer', icon: Code, description: 'Both frontend and backend development' },
    { value: 'designer', label: 'UI/UX Designer', icon: Palette, description: 'User interface and experience design' },
    { value: 'marketing', label: 'Marketing Specialist', icon: Megaphone, description: 'Digital marketing, content, social media' },
    { value: 'business', label: 'Business Analyst', icon: BarChart, description: 'Strategy, market research, business planning' },
    { value: 'other', label: 'Other', icon: Users, description: 'Specify your unique skills and contribution' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/products/${product.id}`}
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <img
                src={product.image || 'https://via.placeholder.com/600x300?text=No+Image'}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>
                <p className="text-slate-300 mb-4">{product.description}</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <User className="w-5 h-5 inline mr-2" />
                Project Owner
              </h3>
              <div className="flex items-start space-x-4">
                <img
                  src={product.users.avatar_url || 'https://via.placeholder.com/100x100?text=User'}
                  alt={product.users.full_name}
                  className="w-16 h-16 rounded-full border border-slate-600"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{product.users.full_name}</h4>
                  <p className="text-slate-300 text-sm mb-3">{product.users.bio}</p>
                  <div className="flex items-center space-x-4">
                    {product.users.github_username && (
                      <a
                        href={`https://github.com/${product.users.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                    {product.users.linkedin_url && (
                      <a
                        href={product.users.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <Star className="w-5 h-5 inline mr-2" />
                Why Collaborate?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <span className="text-slate-300">Work with talented Ethiopian developers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Code className="w-5 h-5 text-purple-400 mt-0.5" />
                  <span className="text-slate-300">Build innovative solutions for real problems</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <span className="text-slate-300">Expand your portfolio and network</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                <Users className="w-6 h-6 inline mr-2" />
                Join This Project
              </h2>

              {submitMessage && (
                <div className={`mb-4 p-4 rounded-lg ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <p className={submitMessage.includes('successfully') ? 'text-green-300' : 'text-red-300'}>
                    {submitMessage}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    How would you like to contribute? *
                  </label>
                  <div className="space-y-2">
                    {collaborationRoles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <label
                          key={role.value}
                          className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={selectedRole === role.value}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="text-cyan-600 focus:ring-cyan-500 mt-1"
                            required
                          />
                          <Icon className="w-5 h-5 text-slate-300 mt-0.5" />
                          <div>
                            <span className="text-slate-200 font-medium">{role.label}</span>
                            <p className="text-slate-400 text-sm">{role.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Relevant Experience *
                  </label>
                  <textarea
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="Describe your relevant skills and experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Portfolio/GitHub URL
                  </label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="https://github.com/yourusername or your portfolio URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Availability *
                  </label>
                  <select
                    required
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  >
                    <option value="">Select your availability</option>
                    <option value="full-time">Full-time (40+ hours/week)</option>
                    <option value="part-time">Part-time (20-40 hours/week)</option>
                    <option value="weekends">Weekends only</option>
                    <option value="flexible">Flexible schedule</option>
                    <option value="project-based">Project-based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Message to Project Owner *
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="Introduce yourself and explain why you'd like to collaborate on this project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Collaboration Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Tips for Success
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Be specific about your skills and experience</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Show genuine interest in the project</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Include links to your previous work</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Be clear about your availability</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
