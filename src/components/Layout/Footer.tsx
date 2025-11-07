import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-violet-400 bg-clip-text text-transparent">
                Addis Product
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The platform where Ethiopian developers and startups showcase their innovations.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">{t('nav.products')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=mobile" className="text-gray-400 hover:text-white transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link to="/products?category=web" className="text-gray-400 hover:text-white transition-colors">
                  Web Applications
                </Link>
              </li>
              <li>
                <Link to="/products?category=ai" className="text-gray-400 hover:text-white transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
            </ul>
          </div>

          {/* Government */}
          <div>
            <h3 className="font-semibold mb-4">{t('nav.government')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/government" className="text-gray-400 hover:text-white transition-colors">
                  View Proposals
                </Link>
              </li>
              <li>
                <Link to="/government-submit" className="text-gray-400 hover:text-white transition-colors">
                  Submit Proposal
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-gray-400 hover:text-white transition-colors">
                  Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Addis Product. All rights reserved. Made with ❤️ in Ethiopia</p>
        </div>
      </div>
    </footer>
  );
}