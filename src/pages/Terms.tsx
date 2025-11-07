import React from 'react';
import { useEffect } from 'react';
import { FileText, Users, Shield, AlertTriangle, Scale, Globe, Mail } from 'lucide-react';

export function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-300 text-lg">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Agreement to Terms</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Welcome to Addis Product. These Terms of Service ("Terms") govern your use of our platform and services. 
              By accessing or using Addis Product, you agree to be bound by these Terms. If you disagree with any part 
              of these terms, then you may not access the service.
            </p>
          </section>

          {/* Platform Description */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Platform Description</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                Addis Product is a platform designed for Ethiopian developers, startups, and government entities to:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Showcase innovative products and projects</li>
                <li>• Facilitate collaboration between developers and organizations</li>
                <li>• Enable voting, rating, and community feedback</li>
                <li>• Connect government entities with technology solutions</li>
                <li>• Support fundraising and project funding initiatives</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">User Accounts and Responsibilities</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Account Creation</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• You must provide accurate and complete information</li>
                  <li>• You are responsible for maintaining account security</li>
                  <li>• One person may not maintain multiple accounts</li>
                  <li>• You must be at least 16 years old to create an account</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Account Usage</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Use the platform in compliance with all applicable laws</li>
                  <li>• Respect intellectual property rights of others</li>
                  <li>• Maintain professional and respectful communication</li>
                  <li>• Report any security vulnerabilities or abuse</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Content Guidelines */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Content Guidelines</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Acceptable Content</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Original products, projects, and innovations</li>
                  <li>• Constructive feedback, reviews, and comments</li>
                  <li>• Professional collaboration requests</li>
                  <li>• Legitimate government proposals and requirements</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Prohibited Content</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Spam, misleading, or fraudulent content</li>
                  <li>• Copyrighted material without proper authorization</li>
                  <li>• Offensive, discriminatory, or harmful content</li>
                  <li>• Content that violates Ethiopian laws or regulations</li>
                  <li>• Malicious software or security threats</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Government Services */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Government Services</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                Special terms apply to government-related services:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Government proposals must be submitted in good faith</li>
                <li>• All proposal information must be accurate and complete</li>
                <li>• Government entities are responsible for their own procurement processes</li>
                <li>• Addis Product facilitates connections but is not party to contracts</li>
                <li>• Confidential information should be handled according to government guidelines</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Intellectual Property Rights</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Your Content</h3>
                <p className="text-slate-300 text-sm">
                  You retain ownership of content you submit to Addis Product. By submitting content, you grant us 
                  a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content 
                  on the platform for the purpose of providing our services.
                </p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Platform Content</h3>
                <p className="text-slate-300 text-sm">
                  The Addis Product platform, including its design, functionality, and original content, 
                  is owned by us and protected by intellectual property laws. You may not copy, modify, 
                  or distribute our platform content without permission.
                </p>
              </div>
            </div>
          </section>

          {/* Voting and Rating */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Voting and Rating System</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Voting and ratings should reflect genuine opinions and experiences</li>
                <li>• Manipulation of voting systems is strictly prohibited</li>
                <li>• We reserve the right to remove fraudulent votes or ratings</li>
                <li>• Users may not vote on their own products or create fake accounts for voting</li>
                <li>• Reviews should be honest, constructive, and relevant to the product</li>
              </ul>
            </div>
          </section>

          {/* Funding and Financial Services */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Funding and Financial Services</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                For projects with funding components:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Funding goals and progress must be accurately represented</li>
                <li>• Project creators are responsible for delivering promised outcomes</li>
                <li>• Addis Product is not responsible for funding disputes or project failures</li>
                <li>• All financial transactions are subject to applicable Ethiopian laws</li>
                <li>• Tax obligations are the responsibility of individual users</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Privacy and Data Protection</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">
                Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms, 
                explains how we collect, use, and protect your information. By using our services, you consent 
                to our data practices as described in the Privacy Policy.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Addis Product is provided "as is" without warranties of any kind</li>
                <li>• We are not liable for any indirect, incidental, or consequential damages</li>
                <li>• Our total liability shall not exceed the amount paid by you for our services</li>
                <li>• We are not responsible for third-party content, products, or services</li>
                <li>• Users are responsible for their own interactions and transactions</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Termination</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                We may terminate or suspend your account and access to our services:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• For violations of these Terms of Service</li>
                <li>• For fraudulent, abusive, or harmful behavior</li>
                <li>• For extended periods of inactivity</li>
                <li>• At our discretion with or without notice</li>
              </ul>
              <p className="text-slate-300 mt-4 text-sm">
                Upon termination, your right to use the service will cease immediately, but these Terms 
                will remain in effect regarding any content you submitted.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Governing Law</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">
                These Terms shall be governed by and construed in accordance with the laws of Ethiopia. 
                Any disputes arising from these Terms or your use of our services shall be subject to 
                the exclusive jurisdiction of the courts of Ethiopia.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Changes to Terms</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">
                We reserve the right to modify these Terms at any time. We will notify users of any material 
                changes by posting the updated Terms on our platform and updating the "Last updated" date. 
                Your continued use of the service after such changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Contact Information</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-slate-300 text-sm">
                <p>• Email: legal@addisproduct.et</p>
                <p>• Address: ICT Park, Building A, Bole Sub City, Addis Ababa, Ethiopia</p>
                <p>• Phone: +251-11-xxx-xxxx</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}