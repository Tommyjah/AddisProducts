import React from 'react';
import { useEffect } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, Users, FileText, Shield, Target, Lightbulb } from 'lucide-react';

export function Guidelines() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <BookOpen className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Government Proposal Guidelines
          </h1>
          <p className="text-slate-300 text-lg">
            Comprehensive guide for submitting technology proposals to Ethiopian government entities
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* Overview */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Overview</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              The Government Proposal System on Addis Product connects Ethiopian developers, startups, and technology 
              companies with government entities seeking innovative solutions. This guide outlines the requirements, 
              processes, and best practices for successful proposal submissions.
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-emerald-300 text-sm">
                <strong>Important:</strong> All proposals undergo a thorough review process by relevant government 
                departments. Ensure your submission is complete, accurate, and addresses the specific requirements.
              </p>
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Eligibility Requirements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Individual Developers</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Ethiopian citizen or legal resident</li>
                  <li>• Proven technical expertise in relevant field</li>
                  <li>• Portfolio of previous work or projects</li>
                  <li>• Valid identification documents</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Companies & Organizations</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Registered business in Ethiopia</li>
                  <li>• Valid trade license and tax certificates</li>
                  <li>• Relevant industry experience</li>
                  <li>• Financial capacity to execute projects</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Proposal Categories */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Proposal Categories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Digital Identity & Authentication',
                'E-Government Services',
                'Healthcare Management',
                'Education Technology',
                'Transportation Systems',
                'Agricultural Technology',
                'Financial Systems',
                'Public Safety & Security',
                'Environmental Monitoring',
                'Infrastructure Management',
                'Data Analytics & BI',
                'Communication Systems'
              ].map((category, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-3 text-center">
                  <span className="text-slate-200 text-sm">{category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Process */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Submission Process</h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: 'Project Overview',
                  description: 'Provide comprehensive project details including title, description, category, budget, and timeline.',
                  color: 'emerald'
                },
                {
                  step: 2,
                  title: 'Contact & Department Information',
                  description: 'Specify the requesting department, contact person, and key stakeholders involved.',
                  color: 'cyan'
                },
                {
                  step: 3,
                  title: 'Technical Requirements',
                  description: 'Detail functional requirements, technical specifications, security needs, and deliverables.',
                  color: 'purple'
                },
                {
                  step: 4,
                  title: 'Implementation & Review',
                  description: 'Outline implementation phases, success criteria, risk assessment, and supporting documents.',
                  color: 'yellow'
                }
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className={`w-10 h-10 bg-${item.color}-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-300 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Required Documents</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Technical Documents</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• System architecture diagrams</li>
                  <li>• Technical specifications document</li>
                  <li>• Security and compliance framework</li>
                  <li>• Integration requirements</li>
                  <li>• Testing and quality assurance plan</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Business Documents</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• Detailed project timeline</li>
                  <li>• Budget breakdown and justification</li>
                  <li>• Team qualifications and CVs</li>
                  <li>• Previous project portfolio</li>
                  <li>• Risk assessment and mitigation plan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Evaluation Criteria</h2>
            </div>
            <div className="space-y-4">
              {[
                { criteria: 'Technical Feasibility', weight: '25%', description: 'Viability of the proposed technical solution' },
                { criteria: 'Team Expertise', weight: '20%', description: 'Qualifications and experience of the project team' },
                { criteria: 'Budget & Timeline', weight: '20%', description: 'Realistic budget estimates and project timeline' },
                { criteria: 'Innovation & Impact', weight: '15%', description: 'Innovative approach and potential impact' },
                { criteria: 'Security & Compliance', weight: '10%', description: 'Adherence to security and regulatory requirements' },
                { criteria: 'Sustainability', weight: '10%', description: 'Long-term maintenance and scalability' }
              ].map((item, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{item.criteria}</h3>
                    <span className="text-emerald-400 font-bold">{item.weight}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Best Practices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-300 font-semibold mb-2">✓ Do</h3>
                  <ul className="text-slate-300 space-y-1 text-sm">
                    <li>• Research the requesting department thoroughly</li>
                    <li>• Provide detailed and accurate information</li>
                    <li>• Include relevant case studies and examples</li>
                    <li>• Address security and compliance requirements</li>
                    <li>• Propose realistic timelines and budgets</li>
                    <li>• Highlight your team's relevant experience</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h3 className="text-red-300 font-semibold mb-2">✗ Don't</h3>
                  <ul className="text-slate-300 space-y-1 text-sm">
                    <li>• Submit incomplete or inaccurate proposals</li>
                    <li>• Overpromise on deliverables or timelines</li>
                    <li>• Ignore security and compliance requirements</li>
                    <li>• Submit generic proposals without customization</li>
                    <li>• Underestimate project complexity or costs</li>
                    <li>• Fail to provide supporting documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Review Process */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Review Process & Timeline</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Review Stages</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Initial Review</span>
                      <span className="text-slate-400 text-sm ml-2">(5-7 business days)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Technical Evaluation</span>
                      <span className="text-slate-400 text-sm ml-2">(10-14 business days)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Department Review</span>
                      <span className="text-slate-400 text-sm ml-2">(7-10 business days)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Final Decision</span>
                      <span className="text-slate-400 text-sm ml-2">(3-5 business days)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Status Updates</h3>
                <p className="text-slate-300 text-sm">
                  You will receive email notifications at each stage of the review process. You can also 
                  track your proposal status on your dashboard. If additional information is required, 
                  you will be contacted directly by the reviewing department.
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Our team is here to help you navigate the proposal submission process. 
              Contact us for guidance, clarifications, or technical support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:government@addisproduct.et"
                className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-all"
              >
                Email Support
              </a>
              <a
                href="/contact"
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-all"
              >
                Contact Form
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}