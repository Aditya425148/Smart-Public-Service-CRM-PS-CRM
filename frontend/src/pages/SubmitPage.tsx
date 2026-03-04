import React from 'react';
import { ComplaintForm } from '../components/ComplaintForm';
import { useNavigate } from 'react-router-dom';

export const SubmitPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report a Civic Issue</h1>
        <p className="text-gray-600">
          Help us fix your neighborhood. Report potholes, broken lights, garbage, water issues, and more.
        </p>
      </div>

      <ComplaintForm
        onSuccess={() => {
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }}
      />
    </div>
  );
};
