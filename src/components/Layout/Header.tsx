import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function Header() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Addis Product
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/products"
              className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
            >
              {t('nav.products')}
            </Link>
            <Link
              to="/government"
              className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
            >
              {t('nav.government')}
            </Link>
            <Link
              to="/submit"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
            >
              {t('nav.submit')}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-slate-200 hover:text-cyan-400 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'en' ? 'AM' : 'EN'}</span>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 hover:bg-slate-700 rounded-lg p-2 transition-colors">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-600"
                  />
                  <span className="hidden sm:block text-sm font-medium text-slate-200">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-200 hover:text-cyan-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700 bg-slate-800">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </form>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-cyan-400 font-medium transition-colors"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-cyan-400 font-medium transition-colors"
              >
                {t('nav.products')}
              </Link>
              <Link
                to="/government"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-cyan-400 font-medium transition-colors"
              >
                {t('nav.government')}
              </Link>
              <Link
                to="/submit"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all text-center shadow-lg"
              >
                {t('nav.submit')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}