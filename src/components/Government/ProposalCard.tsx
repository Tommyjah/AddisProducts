import React from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { GovernmentProposal } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProposalCardProps {
  proposal: GovernmentProposal;
}

const getStatusIcon = (status: GovernmentProposal['status']) => {
  switch (status) {
    case 'submitted':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'under_review':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'accepted':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'declined':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: GovernmentProposal['status']) => {
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

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { t, language } = useLanguage();

  const title = language === 'am' && proposal.titleAm ? proposal.titleAm : proposal.title;
  const description = language === 'am' && proposal.descriptionAm ? proposal.descriptionAm : proposal.description;

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-slate-300 text-sm line-clamp-2">{description}</p>
          </div>
          
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(proposal.status)}`}>
            {getStatusIcon(proposal.status)}
            <span>{t(`gov.status.${proposal.status}`)}</span>
          </div>
        </div>

        {/* Details */}
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

        {/* Requirements */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Key Requirements:</h4>
          <ul className="space-y-1">
            {proposal.requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="text-xs text-slate-400 flex items-start">
                <span className="w-1 h-1 bg-emerald-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                {req}
              </li>
            ))}
            {proposal.requirements.length > 3 && (
              <li className="text-xs text-slate-500 italic">
                +{proposal.requirements.length - 3} more requirements...
              </li>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <img
              src={proposal.user.avatar}
              alt={proposal.user.name}
              className="w-6 h-6 rounded-full border border-slate-600"
            />
            <span className="text-sm text-slate-300">{proposal.user.name}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{proposal.submittedAt.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Review Notes */}
        {proposal.reviewNotes && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg border-l-4 border-emerald-500">
            <p className="text-xs text-slate-300">
              <span className="font-medium">Review Notes:</span> {proposal.reviewNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}