import React from 'react';
import { useEffect } from 'react';
import { Shield, Eye, Lock, Users, Database, Globe, AlertTriangle, Mail } from 'lucide-react';

export function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Privacy Policy
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
              <Eye className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Introduction</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              At Addis Product, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. 
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Name, email address, and profile information</li>
                  <li>• Authentication data from third-party providers (Google, GitHub)</li>
                  <li>• Professional information (bio, skills, social media links)</li>
                  <li>• Contact information for government proposals</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Product & Project Data</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Product descriptions, images, and technical specifications</li>
                  <li>• Voting and rating data</li>
                  <li>• Comments, reviews, and collaboration requests</li>
                  <li>• Government proposal submissions and related documents</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Usage Information</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Device information and browser type</li>
                  <li>• IP address and location data</li>
                  <li>• Platform usage patterns and preferences</li>
                  <li>• Search queries and interaction data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Platform Services</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Provide and maintain our services</li>
                  <li>• Process product submissions and proposals</li>
                  <li>• Enable voting, rating, and collaboration features</li>
                  <li>• Facilitate government-developer connections</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Communication & Support</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Send important platform updates</li>
                  <li>• Respond to support requests</li>
                  <li>• Notify about collaboration opportunities</li>
                  <li>• Share relevant community news</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Information Sharing</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• <strong>Public Information:</strong> Product details, ratings, and comments you choose to make public</li>
                <li>• <strong>Government Proposals:</strong> Information shared with relevant government entities for proposal evaluation</li>
                <li>• <strong>Service Providers:</strong> Trusted third parties who assist in operating our platform</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li>• <strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Data Security</h2>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Technical Measures</h3>
                  <ul className="text-slate-300 space-y-1 text-sm">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• Secure database storage with encryption</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Organizational Measures</h3>
                  <ul className="text-slate-300 space-y-1 text-sm">
                    <li>• Limited access to personal data</li>
                    <li>• Employee training on data protection</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular backup and recovery testing</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Your Rights</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">You have the following rights regarding your personal information:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Access:</strong> Request copies of your personal data</li>
                  <li>• <strong>Rectification:</strong> Correct inaccurate information</li>
                  <li>• <strong>Erasure:</strong> Request deletion of your data</li>
                  <li>• <strong>Portability:</strong> Transfer your data to another service</li>
                </ul>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Restriction:</strong> Limit how we process your data</li>
                  <li>• <strong>Objection:</strong> Object to certain data processing</li>
                  <li>• <strong>Withdraw Consent:</strong> Revoke previously given consent</li>
                  <li>• <strong>Complaint:</strong> File complaints with supervisory authorities</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Cookies and Tracking</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• <strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li>• <strong>Analytics Cookies:</strong> Help us understand platform usage</li>
                <li>• <strong>Marketing Cookies:</strong> Deliver relevant content and advertisements</li>
              </ul>
              <p className="text-slate-300 mt-4 text-sm">
                You can control cookie preferences through your browser settings or our cookie consent manager.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">International Data Transfers</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">
                Your information may be transferred to and processed in countries other than Ethiopia. 
                We ensure appropriate safeguards are in place to protect your data during international transfers, 
                including standard contractual clauses and adequacy decisions where applicable.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review 
                this Privacy Policy periodically for any changes.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-slate-300 text-sm">
                <p>• Email: privacy@addisproduct.et</p>
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