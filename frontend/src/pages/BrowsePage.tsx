import React, { useState, useEffect } from 'react';
import { getComplaints } from '../api';
import { ComplaintList } from '../components/ComplaintCard';
import { Filter } from 'lucide-react';

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

const CATEGORIES = [
  'Garbage', 'Streetlight', 'Pothole', 'Water', 'Sanitation', 'Construction', 'Safety', 'Other'
];

const STATUSES = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'closed'];

export const BrowsePage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getComplaints({ category: category || undefined, status: status || undefined });
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {complaints.length} Issue{complaints.length !== 1 ? 's' : ''} Found
          </h3>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading complaints...</div>
        ) : (
          <ComplaintList complaints={complaints} />
        )}
      </div>
    </div>
  );
};
