import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, Clock, User, Building, Phone, Mail, CheckCircle, XCircle, AlertCircle, FileText, Users, Shield, Zap, Target, TrendingUp } from 'lucide-react';
import { mockGovernmentProposals } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function GovernmentProposalDetail() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const proposal = mockGovernmentProposals.find(p => p.id === id);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Proposal not found</h1>
          <Link to="/government" className="text-emerald-400 hover:text-emerald-300">
            ← Back to Government Proposals
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: typeof proposal.status) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: typeof proposal.status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'declined':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const title = language === 'am' && proposal.titleAm ? proposal.titleAm : proposal.title;
  const description = language === 'am' && proposal.descriptionAm ? proposal.descriptionAm : proposal.description;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'requirements', label: 'Requirements', icon: Zap },
    { id: 'timeline', label: 'Timeline & Budget', icon: Clock },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Project Description</h3>
        <p className="text-slate-300 leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Target className="w-5 h-5 inline mr-2" />
            Key Objectives
          </h3>
          <ul className="space-y-2">
            {proposal.requirements.slice(0, 5).map((req, index) => (
              <li key={index} className="text-slate-300 flex items-start">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Expected Benefits
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-slate-300">Improved efficiency and automation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-slate-300">Enhanced citizen services</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-slate-300">Cost reduction and resource optimization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Functional Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposal.requirements.map((req, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs font-semibold">{index + 1}</span>
              </div>
              <span className="text-slate-300 text-sm">{req}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Shield className="w-5 h-5 inline mr-2" />
            Security & Compliance
          </h3>
          <ul className="space-y-2">
            <li className="text-slate-300 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Data encryption and secure storage
            </li>
            <li className="text-slate-300 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Multi-factor authentication
            </li>
            <li className="text-slate-300 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Audit trails and logging
            </li>
            <li className="text-slate-300 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Compliance with government standards
            </li>
          </ul>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Zap className="w-5 h-5 inline mr-2" />
            Technical Specifications
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Platform:</span>
              <span className="text-white">Web & Mobile</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database:</span>
              <span className="text-white">PostgreSQL/MongoDB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Integration:</span>
              <span className="text-white">REST APIs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Languages:</span>
              <span className="text-white">Amharic, English</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Budget Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Development</span>
              <span className="text-white font-semibold">${(proposal.budget * 0.6).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '60%' }} />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Testing & QA</span>
              <span className="text-white font-semibold">${(proposal.budget * 0.2).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: '20%' }} />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Deployment & Training</span>
              <span className="text-white font-semibold">${(proposal.budget * 0.2).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '20%' }} />
            </div>
            
            <div className="border-t border-slate-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total Budget</span>
                <span className="text-2xl font-bold text-emerald-400">${proposal.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Clock className="w-5 h-5 inline mr-2" />
            Project Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">1</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Planning & Analysis</h4>
                <p className="text-slate-400 text-sm">2 months</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">2</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Development</h4>
                <p className="text-slate-400 text-sm">12 months</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">3</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Testing & Deployment</h4>
                <p className="text-slate-400 text-sm">3 months</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">4</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Training & Handover</h4>
                <p className="text-slate-400 text-sm">1 month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStakeholders = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          <Users className="w-5 h-5 inline mr-2" />
          Project Stakeholders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700 rounded-lg">
            <h4 className="text-white font-medium mb-2">Primary Stakeholders</h4>
            <ul className="space-y-2">
              <li className="text-slate-300 flex items-center">
                <Building className="w-4 h-4 text-emerald-400 mr-2" />
                Ministry of Innovation and Technology
              </li>
              <li className="text-slate-300 flex items-center">
                <Users className="w-4 h-4 text-cyan-400 mr-2" />
                Government Employees
              </li>
              <li className="text-slate-300 flex items-center">
                <User className="w-4 h-4 text-purple-400 mr-2" />
                Ethiopian Citizens
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-700 rounded-lg">
            <h4 className="text-white font-medium mb-2">Secondary Stakeholders</h4>
            <ul className="space-y-2">
              <li className="text-slate-300 flex items-center">
                <Building className="w-4 h-4 text-yellow-400 mr-2" />
                Regional Governments
              </li>
              <li className="text-slate-300 flex items-center">
                <Shield className="w-4 h-4 text-red-400 mr-2" />
                Security Agencies
              </li>
              <li className="text-slate-300 flex items-center">
                <Users className="w-4 h-4 text-blue-400 mr-2" />
                IT Support Teams
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Project Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Daniel Kebede</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">daniel.kebede@mit.gov.et</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">+251-11-xxx-xxxx</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Department</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Ministry of Innovation and Technology</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Submitted: {proposal.submittedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/government"
          className="inline-flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Government Proposals</span>
        </Link>

        {/* Header */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              <p className="text-slate-300 text-lg">{description}</p>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(proposal.status)}`}>
              {getStatusIcon(proposal.status)}
              <span className="font-medium">{t(`gov.status.${proposal.status}`)}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">${proposal.budget.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{proposal.timeline}</div>
              <div className="text-sm text-slate-400">Timeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{proposal.requirements.length}</div>
              <div className="text-sm text-slate-400">Requirements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">High</div>
              <div className="text-sm text-slate-400">Priority</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'requirements' && renderRequirements()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'stakeholders' && renderStakeholders()}
          </div>
        </div>

        {/* Review Notes */}
        {proposal.reviewNotes && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Review Notes</h3>
            <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-emerald-500">
              <p className="text-slate-300">{proposal.reviewNotes}</p>
              {proposal.reviewedAt && (
                <p className="text-sm text-slate-400 mt-2">
                  Reviewed on {proposal.reviewedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {user?.role === 'government' && (
          <div className="flex items-center justify-end space-x-4 mt-8">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Decline Proposal
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg">
              Accept Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}