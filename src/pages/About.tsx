import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Globe, Heart, Code, Lightbulb, Shield } from 'lucide-react';

export function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">AP</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
            About Addis Product
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Empowering Ethiopian developers and startups to showcase their innovations, 
            connect with collaborators, and build the future of technology in Ethiopia.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed">
              To create a thriving ecosystem where Ethiopian developers, entrepreneurs, and innovators 
              can showcase their products, collaborate on projects, and access opportunities that drive 
              technological advancement in Ethiopia and beyond.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
              <Lightbulb className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-slate-300 leading-relaxed">
              To position Ethiopia as a leading hub for technological innovation in Africa, 
              fostering a culture of creativity, collaboration, and entrepreneurship that 
              transforms ideas into impactful solutions.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <Code className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Product Showcase</h3>
              <p className="text-slate-300">
                Provide a platform for developers to showcase their innovative products, 
                gain visibility, and receive feedback from the community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community Building</h3>
              <p className="text-slate-300">
                Foster collaboration between developers, designers, entrepreneurs, 
                and government entities to build stronger tech ecosystem.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Government Bridge</h3>
              <p className="text-slate-300">
                Connect innovative solutions with government needs through our 
                specialized proposal system for public sector projects.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community First</h3>
              <p className="text-slate-300 text-sm">
                We prioritize the needs and growth of our developer community.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Excellence</h3>
              <p className="text-slate-300 text-sm">
                We strive for the highest quality in everything we build and support.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Inclusivity</h3>
              <p className="text-slate-300 text-sm">
                We welcome developers from all backgrounds and skill levels.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
              <Lightbulb className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
              <p className="text-slate-300 text-sm">
                We encourage creative thinking and breakthrough solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
              <div className="text-slate-300">Products Showcased</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">1000+</div>
              <div className="text-slate-300">Active Developers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">50+</div>
              <div className="text-slate-300">Government Proposals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">$2M+</div>
              <div className="text-slate-300">Funding Raised</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
            Be part of Ethiopia's growing tech ecosystem. Share your innovations, 
            collaborate with fellow developers, and help shape the future of technology in Ethiopia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-all"
            >
              Submit Your Product
            </Link>
            <Link
              to="/products"
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-all"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}