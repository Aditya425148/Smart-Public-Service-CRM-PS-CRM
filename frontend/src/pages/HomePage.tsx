import React, { useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { MapView } from '../components/MapView';
import { MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="space-y-6">
      {/* Navigation Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/submit"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Report Issue
        </Link>
        <Link
          to="/browse"
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <MapPin className="w-5 h-5" />
          Browse Issues
        </Link>
      </div>

      {/* Dashboard */}
      <Dashboard />

      {/* Map Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Issues in Your Area</h3>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showMap ? 'Hide' : 'Show'} map
          </button>
        </div>

        {showMap && <MapView />}
      </div>
    </div>
  );
};
