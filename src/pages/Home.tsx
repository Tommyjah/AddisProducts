import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, Rocket, Users, Search } from 'lucide-react';
import { ProductCard } from '../components/Product/ProductCard';
import { CategoryFilter } from '../components/Product/CategoryFilter';
import { mockProducts } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featuredProducts = mockProducts.filter(p => p.isFeatured);
  const trendingProducts = mockProducts
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 6);

  const filteredProducts = selectedCategory === 'all' 
    ? trendingProducts
    : trendingProducts.filter(p => p.category.toLowerCase().includes(selectedCategory));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/25"
              >
                Explore Products
              </Link>
              <Link
                to="/submit"
                className="bg-slate-800 text-white border border-slate-600 px-8 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all shadow-lg"
              >
                Submit Your Product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                <Rocket className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{mockProducts.length}+</div>
              <div className="text-slate-300">Products</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">150+</div>
              <div className="text-slate-300">Developers</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                ${mockProducts.reduce((sum, p) => sum + (p.currentFunding || 0), 0).toLocaleString()}
              </div>
              <div className="text-slate-300">Funding Raised</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {mockProducts.reduce((sum, p) => sum + p.votes, 0)}
              </div>
              <div className="text-slate-300">Total Votes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">{t('home.featured')}</h2>
            <Link
              to="/products"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">{t('home.trending')}</h2>
          </div>
          
          {/* Category Filter */}
          <div className="mb-8">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 to-purple-600/90"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
            Ready to showcase your innovation?
          </h2>
          <p className="text-lg text-cyan-100 mb-8 relative z-10">
            Join the growing community of Ethiopian developers and startups making an impact.
          </p>
          <Link
            to="/submit"
            className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium hover:bg-slate-100 transition-all transform hover:scale-105 inline-block shadow-lg relative z-10"
          >
            Submit Your Product
          </Link>
        </div>
      </section>
    </div>
  );
}