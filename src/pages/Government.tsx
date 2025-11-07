import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { ProposalCard } from '../components/Government/ProposalCard';
import { mockGovernmentProposals } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function Government() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredProposals = statusFilter === 'all' 
    ? mockGovernmentProposals
    : mockGovernmentProposals.filter(p => p.status === statusFilter);

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case 'budget':
        return b.budget - a.budget;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('gov.title')}</h1>
            <p className="text-slate-300">
              {t('gov.subtitle')}
            </p>
          </div>
          
          {user && (
            <Link
              to="/government-submit"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{t('gov.submit')}</span>
            </Link>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            Government Technology Proposals
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            This platform enables Ethiopian developers and companies to submit technology proposals 
            for government use cases. Government officers can review, evaluate, and provide feedback 
            on submitted proposals. All proposals undergo a thorough review process to ensure they 
            meet government requirements and standards.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-slate-400" />
              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="all">All Proposals</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="budget">Highest Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-slate-300">
            Showing {sortedProposals.length} proposal{sortedProposals.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && (
              <span> with status: {t(`gov.status.${statusFilter}`)}</span>
            )}
          </p>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedProposals.map((proposal) => (
            <Link key={proposal.id} to={`/government/${proposal.id}`}>
              <ProposalCard proposal={proposal} />
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {sortedProposals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">No proposals found with the selected filters.</div>
            <button
              onClick={() => setStatusFilter('all')}
              className="mt-4 text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Show all proposals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}