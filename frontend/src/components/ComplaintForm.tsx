import React, { useState, useEffect } from 'react';
import { createComplaint, suggestCategory } from '../api';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  pin_code?: string;
  state?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  file?: File;
}

const CATEGORIES = [
  'Garbage',
  'Streetlight',
  'Pothole',
  'Water',
  'Sanitation',
  'Construction',
  'Safety',
  'Other',
];

const SUBCATEGORIES: Record<string, string[]> = {
  'Pothole': ['Road', 'Footpath', 'Bridge'],
  'Streetlight': ['Broken', 'Flickering', 'Missing'],
  'Water': ['Leak', 'Low Pressure', 'Contamination'],
  'Garbage': ['Overflow', 'Littered', 'Disposal'],
  'Construction': ['Illegal', 'Unauthorized', 'Unsafe'],
  'Safety': ['Accident Risk', 'Hazard', 'Crime'],
  'Sanitation': ['Dirty', 'Odor', 'Hygiene'],
};

export const ComplaintForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    pin_code: '',
    state: '',
    city: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    file: undefined,
  });

  const [suggestedCategory, setSuggestedCategory] = useState<{ category: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setFormData(prev => ({
            ...prev,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }));
        },
        () => console.log('Could not get location')
      );
    }
  }, []);

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));

    if (value.length > 10) {
      try {
        const suggestion = await suggestCategory(value);
        setSuggestedCategory(suggestion);
      } catch (error) {
        console.error('Failed to get suggestion:', error);
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: category,
      subcategory: '',
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in first to submit a complaint');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createComplaint({
        title: formData.title,
        description: formData.description,
        category: formData.category || suggestedCategory?.category,
        subcategory: formData.subcategory,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pin_code,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        pin_code: '',
        state: '',
        city: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        file: undefined,
      });
      setSuggestedCategory(null);

      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-blue-600" />
        <h3 className="font-semibold text-blue-900 mb-2">Login Required</h3>
        <p className="text-blue-700">Please log in to submit a complaint</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Report an Issue</h2>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Complaint submitted successfully!</p>
            <p className="text-sm text-green-700">You can track it from the dashboard</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Broken streetlight on Main St"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Describe the issue in detail (max 500 chars)"
          maxLength={500}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {suggestedCategory && suggestedCategory.confidence > 0.6 && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="text-blue-900">
              💡 AI Suggestion: <strong>{suggestedCategory.category}</strong> ({(suggestedCategory.confidence * 100).toFixed(0)}% confidence)
            </p>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      {formData.category && SUBCATEGORIES[formData.category] && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category</label>
          <select
            value={formData.subcategory}
            onChange={e => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select sub-category</option>
            {SUBCATEGORIES[formData.category].map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      {/* Address Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="e.g., 123 Main Street"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City / Township</label>
          <input
            type="text"
            value={formData.city}
            onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="e.g., New Delhi"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State / Territory</label>
          <input
            type="text"
            value={formData.state}
            onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
            placeholder="e.g., Delhi"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
        <input
          type="text"
          value={formData.pin_code}
          onChange={e => setFormData(prev => ({ ...prev, pin_code: e.target.value }))}
          placeholder="e.g., 110001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.file && (
          <p className="mt-2 text-sm text-gray-600">✓ {formData.file.name}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
};
