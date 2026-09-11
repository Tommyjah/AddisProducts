import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  fetchAdminUsers,
  updateUserRole,
  fetchAdminActivityLog,
  fetchAdminSubscribers,
  fetchAdminStats,
  fetchAllProductsAdmin,
  fetchAllProposalsAdmin,
  type AdminUser,
  type AdminActivity,
  type AdminSubscriber,
  type AdminDashboardStats,
  type Product,
  type GovernmentProposal,
} from '../lib/ProductClient';
import { Avatar } from '../components/common/Avatar';
import {
  Users,
  Package,
  FileText,
  ListChecks,
  Mail,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  DollarSign,
  Edit2,
  Save,
  RefreshCw,
} from 'lucide-react';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'proposals', label: 'Proposals', icon: FileText },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
  { id: 'activity', label: 'Activity Log', icon: Activity },
] as const;

type TabId = typeof ADMIN_TABS[number]['id'];

export function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [proposals, setProposals] = useState<GovernmentProposal[]>([]);
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userRoleEdit, setUserRoleEdit] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  const [selectedProposal, setSelectedProposal] = useState<GovernmentProposal | null>(null);
  const [proposalStatusEdit, setProposalStatusEdit] = useState('');
  const [savingProposal, setSavingProposal] = useState(false);

  const loadData = useCallback(async (tab: TabId) => {
    setIsLoading(true);
    setError('');
    try {
      switch (tab) {
        case 'dashboard':
          setStats(await fetchAdminStats());
          break;
        case 'users':
          setUsers(await fetchAdminUsers());
          break;
        case 'products':
          setProducts(await fetchAllProductsAdmin());
          break;
        case 'proposals':
          setProposals(await fetchAllProposalsAdmin());
          break;
        case 'subscribers':
          setSubscribers(await fetchAdminSubscribers());
          break;
        case 'activity':
          setActivity(await fetchAdminActivityLog());
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  const handleSaveUserRole = async () => {
    if (!selectedUser || !userRoleEdit) return;
    setSavingRole(true);
    try {
      await updateUserRole(selectedUser.id, userRoleEdit as 'regular' | 'government' | 'admin');
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: userRoleEdit as 'regular' | 'government' | 'admin' } : u));
      await logAdminActivity('update_user_role', 'users', selectedUser.id, `Set role to ${userRoleEdit}`);
    } catch {
      setError('Failed to update user role');
    } finally {
      setSavingRole(false);
      setSelectedUser(null);
      setUserRoleEdit('');
    }
  };

  const handleSaveProposalStatus = async () => {
    if (!selectedProposal || !proposalStatusEdit) return;
    setSavingProposal(true);
    try {
      await supabase
        .from('government_proposals')
        .update({ status: proposalStatusEdit, reviewed_at: new Date().toISOString() })
        .eq('id', selectedProposal.id);
      setProposals(proposals.map(p =>
        p.id === selectedProposal.id
          ? { ...p, status: proposalStatusEdit as GovernmentProposal['status'] }
          : p
      ));
      await logAdminActivity('update_proposal_status', 'government_proposals', selectedProposal.id, `Set status to ${proposalStatusEdit}`);
    } catch {
      setError('Failed to update proposal status');
    } finally {
      setSavingProposal(false);
      setSelectedProposal(null);
      setProposalStatusEdit('');
    }
  };

  async function logAdminActivity(action: string, entityType: string, entityId?: string, details?: string) {
    if (!user) return;
    try {
      await supabase.from('admin_activity_log').insert({
        admin_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || null,
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'government': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage platform resources and access all data</p>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex flex-wrap gap-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedUser(null); setSelectedProposal(null); }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {!isLoading && activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Users className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.users_count}</p>
              <span className="text-sm text-slate-500">Users</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Package className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.products_count}</p>
              <span className="text-sm text-slate-500">Products</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.proposals_count}</p>
              <span className="text-sm text-slate-500">Proposals</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.pledges_count}</p>
              <span className="text-sm text-slate-500">Pledges</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <span className="text-2xl font-bold text-slate-900">{stats.subscribers_count}</span>
              <span className="text-sm text-slate-500">Subscribers</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <ListChecks className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.reviews_count}</p>
              <span className="text-sm text-slate-500">Reviews</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center md:col-span-2">
              <DollarSign className="w-8 h-8 text-violet-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.pledges_total.toLocaleString()} ETB</p>
              <span className="text-sm text-slate-500">Total Pledged</span>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Pledged</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Verified</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Avatar src={u.avatar_url} name={u.full_name || ''} size={32} className="rounded-full" />
                        <div>
                          <p className="font-medium text-slate-900">{u.full_name}</p>
                          <p className="text-sm text-slate-500">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm truncate max-w-[200px]">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600">{u.products_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{u.pledges_amount.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {u.is_verified ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-slate-400 mx-auto" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => { setSelectedUser(u); setUserRoleEdit(u.role); }}
                        className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Funding</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <p className="font-medium text-slate-900">{p.title}</p>
                          <p className="text-sm text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Avatar src={p.user.avatar} name={p.user.name} size={24} className="rounded-full" />
                        <span className="text-sm text-slate-600">{p.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{p.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'funding' ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'completed' ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">
                      {p.currentFunding.toLocaleString()} / {p.fundingGoal.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {p.isFeatured ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-slate-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && activeTab === 'proposals' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-900">{proposal.title}</p>
                      <p className="text-sm text-slate-500">{new Date(proposal.submittedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Avatar src={proposal.user.avatar} name={proposal.user.name} size={24} className="rounded-full" />
                        <span className="text-sm text-slate-600">{proposal.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{proposal.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600">{proposal.budget.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => { setSelectedProposal(proposal); setProposalStatusEdit(proposal.status); }}
                        className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && activeTab === 'subscribers' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{s.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{s.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 capitalize">{s.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activity.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{a.admin_name || a.admin_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{a.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{a.entity_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{a.details || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 text-sm">{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Edit User Role</h2>
              <p className="text-sm text-slate-600 mb-4">
                Change role for <strong>{selectedUser.full_name}</strong>
              </p>
              <select
                value={userRoleEdit}
                onChange={(e) => setUserRoleEdit(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none mb-4"
              >
                <option value="regular">Regular User</option>
                <option value="government">Government</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedUser(null); setUserRoleEdit(''); }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUserRole}
                  disabled={savingRole}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingRole ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingRole ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Update Proposal Status</h2>
              <p className="text-sm text-slate-600 mb-4">
                Change status for <strong>{selectedProposal.title}</strong>
              </p>
              <select
                value={proposalStatusEdit}
                onChange={(e) => setProposalStatusEdit(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none mb-4"
              >
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedProposal(null); setProposalStatusEdit(''); }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProposalStatus}
                  disabled={savingProposal}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingProposal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingProposal ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
