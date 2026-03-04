import React from 'react';
import { MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Complaint {
  complaint_id: string;
  title: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  sla_deadline: string;
  verification_count: number;
  priority_score: number;
}

export const ComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{complaint.title}</h3>
          <p className="text-sm text-gray-500">{complaint.complaint_id}</p>
        </div>
        {getStatusIcon(complaint.status)}
      </div>
      
      <div className="flex gap-2 mb-3">
        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {complaint.category}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(complaint.status)}`}>
          {complaint.status.replace('_', ' ')}
        </span>
      </div>

      {complaint.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
      )}

      <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
        <MapPin className="w-4 h-4" />
        <span>
          {complaint.city || complaint.address || 'Location pending'}
        </span>
      </div>

      {complaint.verification_count > 0 && (
        <div className="text-xs text-blue-600 mb-2">
          ✓ {complaint.verification_count} neighbor(s) confirmed
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-500">
        <span>Priority: {(complaint.priority_score * 100).toFixed(0)}%</span>
        <span>Reports: {new Date(complaint.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export const ComplaintList: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No complaints found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {complaints.map(complaint => (
        <ComplaintCard key={complaint.complaint_id} complaint={complaint} />
      ))}
    </div>
  );
};
