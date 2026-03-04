import React, { useState, useEffect } from 'react';
import { getStats } from '../api';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  resolved_this_month: number;
  in_progress: number;
  total_reported: number;
  average_priority: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (!stats) {
    return <div className="p-6 text-center text-gray-500">Failed to load statistics</div>;
  }

  return (
    <div className="space-y-4">
      {/* Impact Counter */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Issues Resolved This Month</p>
            <h2 className="text-4xl font-bold">{stats.resolved_this_month}</h2>
          </div>
          <CheckCircle className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Reported */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Reported</span>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_reported}</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Progress</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
        </div>
      </div>

      {/* Progress Ring */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-600 mb-4">Overall Priority Score</p>
        <div className="flex items-center justify-center">
          <svg className="w-32 h-32" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={`${Math.PI * 2 * 45 * (stats.average_priority || 0)} ${Math.PI * 2 * 45}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
            {/* Text */}
            <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1f2937">
              {(stats.average_priority * 100).toFixed(0)}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
