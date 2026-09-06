import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, Clock, FileText, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'
import { fetchGovernmentProposals } from '../lib/ProductClient'
import { useLanguage } from '../contexts/LanguageContext'

export function GovernmentProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [proposals, setProposals] = useState<any[]>([])
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchGovernmentProposals()
        setProposals(data)
        const found = data.find(p => p.id === id)
        setProposal(found || null)
      } catch (err) {
        console.error('Failed to load:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

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
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="w-5 h-5 text-blue-400" />
      case 'under_review': return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'declined': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <FileText className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'under_review': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'accepted': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'declined': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'requirements', label: 'Requirements', icon: Zap },
    { id: 'timeline', label: 'Timeline & Budget', icon: Clock },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/government" className="inline-flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Government Proposals</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{proposal.title}</h1>
                  <p className="text-slate-300 text-lg leading-relaxed mb-4">{proposal.description}</p>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(proposal.status)}`}>
                  {getStatusIcon(proposal.status)}
                  <span className="font-medium">{t(`gov.status.${proposal.status}`)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">${proposal.budget.toLocaleString()}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Timeline</span>
                  </div>
                  <div className="text-lg font-bold text-white">{proposal.timeline}</div>
                </div>
              </div>

              {proposal.reviewNotes && (
                <div className="p-4 bg-slate-700 rounded-lg border-l-4 border-emerald-500 mb-6">
                  <p className="text-sm text-slate-300">{proposal.reviewNotes}</p>
                  {proposal.reviewedAt && (
                    <p className="text-xs text-slate-400 mt-2">Reviewed on {new Date(proposal.reviewedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="border-b border-slate-700">
                <nav className="flex space-x-6 px-6">
                  {tabs.map(tab => {
                    const Icon = tab.icon
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'
                        }`}>
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-slate-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Project Description</h3>
                      <p className="text-slate-300 leading-relaxed">{proposal.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Key Objectives</h3>
                        <ul className="space-y-2">
                          {proposal.requirements?.slice(0, 5).map((req: string, i: number) => (
                            <li key={i} className="text-slate-300 flex items-start">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Expected Benefits</h3>
                        <div className="space-y-3">
                          {['Improved efficiency and automation', 'Enhanced citizen services', 'Cost reduction and resource optimization'].map((b, i) => (
                            <div key={i} className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              </div>
                              <span className="text-slate-300">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'requirements' && (
                  <div className="space-y-6">
                    <div className="bg-slate-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Functional Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposal.requirements?.map((req: string, i: number) => (
                          <div key={i} className="flex items-start space-x-3 p-3 bg-slate-600 rounded-lg">
                            <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-emerald-400 text-xs font-semibold">{i + 1}</span>
                            </div>
                            <span className="text-slate-300 text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Security & Compliance</h3>
                        <ul className="space-y-2">
                          {['Data encryption and secure storage', 'Multi-factor authentication', 'Audit trails and logging', 'Compliance with government standards'].map((s, i) => (
                            <li key={i} className="text-slate-300 flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
                        <div className="space-y-3">
                          {[['Platform', 'Web & Mobile'], ['Database', 'PostgreSQL/MongoDB'], ['Integration', 'REST APIs'], ['Languages', 'Amharic, English']].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-slate-400">{k}:</span>
                              <span className="text-white">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Budget Breakdown</h3>
                        <div className="space-y-4">
                          {[['Development', 0.6], ['Testing & QA', 0.2], ['Deployment & Training', 0.2]].map(([label, pct]) => (
                            <div key={label} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-300">{label}</span>
                                <span className="text-white font-semibold">${(proposal.budget * pct).toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-2">
                                <div className={`h-2 rounded-full ${label === 'Development' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : label === 'Testing & QA' ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                                  style={{ width: `${pct * 100}%` }} />
                              </div>
                            </div>
                          ))}
                          <div className="border-t border-slate-600 pt-4 flex justify-between">
                            <span className="text-white font-semibold">Total Budget</span>
                            <span className="text-2xl font-bold text-emerald-400">${proposal.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Project Timeline</h3>
                        <div className="space-y-4">
                          {[['Phase 1: Planning & Design', '2-3 months'], ['Phase 2: Development', '6-12 months'], ['Phase 3: Testing & QA', '2-3 months'], ['Phase 4: Deployment & Training', '1-2 months']].map(([phase, dur], i) => (
                            <div key={i} className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">{i + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{phase}</p>
                                <p className="text-xs text-slate-400">{dur}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'stakeholders' && (
                  <div className="space-y-6">
                    <div className="bg-slate-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Submitting Department</h3>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{proposal.user?.name || 'Government Entity'}</p>
                          <p className="text-sm text-slate-400">{proposal.user?.role || 'Government Officer'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Key Stakeholders</h3>
                      <ul className="space-y-3">
                        {['Department Head', 'IT Director', 'End Users (citizens)', 'Procurement Office'].map((s, i) => (
                          <li key={i} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            <span className="text-slate-300">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Proposal Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-white capitalize">{proposal.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget:</span>
                  <span className="text-white font-semibold">${proposal.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timeline:</span>
                  <span className="text-white">{proposal.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requirements:</span>
                  <span className="text-white">{proposal.requirements?.length || 0} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted:</span>
                  <span className="text-white">{new Date(proposal.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Submitted By</h3>
              <div className="flex items-center space-x-3">
                <img
                  src={proposal.user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop'}
                  alt={proposal.user?.name}
                  className="w-10 h-10 rounded-full border border-slate-600"
                />
                <div>
                  <p className="text-white font-medium">{proposal.user?.name}</p>
                  <p className="text-sm text-slate-400">{proposal.user?.role || 'Government Officer'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
