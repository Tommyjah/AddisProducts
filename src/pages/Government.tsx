import { useState, useEffect } from 'react'
import { Plus, Filter, DollarSign, Clock, FileText } from 'lucide-react'
import { fetchGovernmentProposals } from '../lib/ProductClient'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import type { GovernmentProposal } from '../types'

export function Government() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [proposals, setProposals] = useState<GovernmentProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchGovernmentProposals()
        setProposals(data)
      } catch (err) {
        console.error('Failed to load proposals:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredProposals =
    statusFilter === 'all'
      ? proposals
      : proposals.filter(p => p.status === statusFilter)

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      case 'budget':
        return b.budget - a.budget
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('gov.title')}</h1>
            <p className="text-slate-300">{t('gov.subtitle')}</p>
          </div>
          {user && (
            <a
              href="/government-submit"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{t('gov.submit')}</span>
            </a>
          )}
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">Government Technology Proposals</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            This platform enables Ethiopian developers and companies to submit technology proposals for government use cases.
            Government officers can review, evaluate, and provide feedback on submitted proposals.
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-slate-400" />
              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
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
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="budget">Highest Budget</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-300">
            Showing {loading ? '...' : sortedProposals.length} proposal{sortedProposals.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && <span> with status: {t(`gov.status.${statusFilter}`)}</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
              </div>
            ))
          ) : sortedProposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">No proposals found with the selected filters.</div>
              <button onClick={() => setStatusFilter('all')} className="text-emerald-400 hover:text-emerald-300 font-medium">
                Show all proposals
              </button>
            </div>
          ) : (
            sortedProposals.map(proposal => (
              <a key={proposal.id} href={`/government/${proposal.id}`} className="block">
                <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                          {proposal.title}
                        </h3>
                        <p className="text-slate-300 text-sm line-clamp-2">{proposal.description}</p>
                      </div>
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium bg-slate-700 text-slate-300">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{t(`gov.status.${proposal.status}`)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <DollarSign className="w-4 h-4" />
                        <span>${proposal.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-300">
                        <Clock className="w-4 h-4" />
                        <span>{proposal.timeline}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2">Key Requirements:</h4>
                      <ul className="space-y-1">
                        {proposal.requirements?.slice(0, 3).map((req: string, index: number) => (
                          <li key={index} className="text-xs text-slate-400 flex items-start">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                        {proposal.requirements && proposal.requirements.length > 3 && (
                          <li className="text-xs text-slate-500 italic">
                            +{proposal.requirements.length - 3} more requirements...
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        <img
                          src={proposal.user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'}
                          alt={proposal.user?.name}
                          className="w-6 h-6 rounded-full border border-slate-600"
                        />
                        <span className="text-sm text-slate-300">{proposal.user?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(proposal.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
