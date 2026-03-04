import React from 'react';
import { AlertCircle, ArrowRight, Zap, Users, Smartphone } from 'lucide-react';
import { AuthComponent } from '../components/Auth';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            PS-CRM
          </div>
          <p className="text-sm text-gray-600">Smart Public Service</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Report Civic Issues, Get Results
              </h1>
              <p className="text-xl text-gray-700">
                Help your city work better. Report potholes, broken lights, and other civic problems in seconds. Track resolution in real-time.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Report issues in under 60 seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Get verified by your neighbors</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Track every update on the map</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <p className="text-sm text-gray-600 mb-3">Join thousands of citizens making their cities better</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span>Get started below</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Side - Auth */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
            <AuthComponent />
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">2,340+</p>
              <p className="text-gray-600">Issues Reported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">1,856+</p>
              <p className="text-gray-600">Issues Resolved</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">523+</p>
              <p className="text-gray-600">Active Users</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg mb-4">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report</h3>
              <p className="text-gray-600">Take a photo and describe the issue. Our AI auto-detects the category.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify</h3>
              <p className="text-gray-600">Your neighbors confirm the issue. More confirmations = higher priority.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg mb-4">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track</h3>
              <p className="text-gray-600">Watch live updates as officials work to fix the problem.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p>Smart Public Service CRM v0.2.0</p>
          <p className="text-sm mt-2">Making civic services responsive, one issue at a time</p>
        </div>
      </footer>
    </div>
  );
};
