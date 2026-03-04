import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getComplaint, verifyComplaint } from '../api';
import { AlertCircle, CheckCircle, MapPin, Share2, ThumbsUp } from 'lucide-react';

interface Complaint {
  complaint_id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  priority_score: number;
  created_at: string;
  sla_deadline: string;
  verification_count: number;
  photos?: string[];
}

const STATUS_TIMELINE = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'closed'];

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      try {
        const data = await getComplaint(id);
        setComplaint(data);
      } catch (err) {
        setError('Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !phone) return;

    setVerifying(true);
    try {
      const result = await verifyComplaint(id, phone);
      if (complaint) {
        setComplaint(prev => prev ? { ...prev, verification_count: result.verification_count } : null);
      }
      setPhone('');
    } catch (err) {
      setError('Failed to verify complaint');
    } finally {
      setVerifying(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: complaint?.title,
        text: `Check out this civic issue: ${complaint?.title}`,
        url: window.location.href,
      });
    } else {
      alert('Share link: ' + window.location.href);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (error || !complaint) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  const currentStatusIndex = STATUS_TIMELINE.indexOf(complaint.status);
  const slaDeadline = new Date(complaint.sla_deadline);
  const now = new Date();
  const isOverdue = now > slaDeadline;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
            <p className="text-gray-500 font-mono">{complaint.complaint_id}</p>
          </div>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Category</p>
            <p className="font-semibold text-gray-900">{complaint.category}</p>
          </div>
          {complaint.subcategory && (
            <div>
              <p className="text-gray-600">Sub-category</p>
              <p className="font-semibold text-gray-900">{complaint.subcategory}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
        <div className="space-y-3">
          {STATUS_TIMELINE.map((status, index) => (
            <div key={status} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStatusIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index < currentStatusIndex ? '✓' : index + 1}
              </div>
              <span className={index <= currentStatusIndex ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Status */}
      <div className={`p-4 rounded-lg border-l-4 ${
        isOverdue
          ? 'bg-red-50 border-red-400'
          : 'bg-blue-50 border-blue-400'
      }`}>
        <div className="flex items-start gap-3">
          {isOverdue ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={isOverdue ? 'text-red-900 font-semibold' : 'text-blue-900 font-semibold'}>
              {isOverdue ? 'SLA OVERDUE' : 'SLA Deadline'}
            </p>
            <p className={isOverdue ? 'text-red-700 text-sm' : 'text-blue-700 text-sm'}>
              {slaDeadline.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {complaint.description && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{complaint.description}</p>
        </div>
      )}

      {/* Location */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Location</h3>
        </div>
        {complaint.address || complaint.city ? (
          <div className="space-y-2">
            {complaint.address && (
              <p className="text-gray-700">{complaint.address}</p>
            )}
            {(complaint.city || complaint.state || complaint.pin_code) && (
              <p className="text-gray-600 text-sm">
                {[complaint.city, complaint.state, complaint.pin_code]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {complaint.latitude && complaint.longitude && (
              <p className="text-gray-500 text-xs pt-2 border-t border-gray-200">
                Coordinates: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
              </p>
            )}
          </div>
        ) : complaint.latitude && complaint.longitude ? (
          <p className="text-gray-700">
            {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
          </p>
        ) : (
          <p className="text-gray-500">Location not provided</p>
        )}
      </div>

      {/* Community Verification */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Community Verification</h3>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-900 font-medium text-lg">
            {complaint.verification_count} neighbor(s) confirmed this issue
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Your phone number to verify"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={verifying || !phone}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Priority Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {(complaint.priority_score * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Reported Date</p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(complaint.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
