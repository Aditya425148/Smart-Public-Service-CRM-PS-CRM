import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Star, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { account } from "../../appwrite";
import { toast } from "sonner";

export default function WorkerProfile() {
  const [worker, setWorker] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    account
      .get()
      .then((user) => {
        const workerData = {
          id: "WKR-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
          name: user.name || "Field Worker",
          email: user.email,
          phone: user.phone || "+919876543210",
          area: "North Delhi",
          state: "Delhi",
          rating: 4.5,
          status: "Available",
          tasksCompleted: 42,
          joinDate: "2024-01-15",
        };
        setWorker(workerData);
        setFormData(workerData);
      })
      .catch(() => {
        const fallback = {
          id: "WKR-001",
          name: "Field Worker",
          email: "worker@example.com",
          phone: "+919876543210",
          area: "North Delhi",
          state: "Delhi",
          rating: 4.5,
          status: "Available",
          tasksCompleted: 42,
          joinDate: "2024-01-15",
        };
        setWorker(fallback);
        setFormData(fallback);
      });
  }, []);

  const handleSave = () => {
    setWorker(formData);
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  if (!worker) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {worker.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">
              {worker.name}
            </h1>
            <p className="text-slate-600 mt-1">Field Worker • {worker.state}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="text-amber-500 fill-amber-500" size={16} />
                <span className="font-bold text-slate-900">
                  {worker.rating}
                </span>
              </div>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                {worker.status}
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition"
            >
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Mail size={16} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                Email
              </span>
            </div>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full text-sm font-medium text-slate-900 bg-white rounded border border-slate-200 p-2"
              />
            ) : (
              <p className="font-medium text-slate-900">{worker.email}</p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Phone size={16} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                Phone
              </span>
            </div>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full text-sm font-medium text-slate-900 bg-white rounded border border-slate-200 p-2"
              />
            ) : (
              <p className="font-medium text-slate-900">{worker.phone}</p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <MapPin size={16} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                Assigned Area
              </span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                className="w-full text-sm font-medium text-slate-900 bg-white rounded border border-slate-200 p-2"
              />
            ) : (
              <p className="font-medium text-slate-900">{worker.area}</p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <User size={16} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                State
              </span>
            </div>
            <p className="font-medium text-slate-900">{worker.state}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-black text-emerald-700">
              {worker.tasksCompleted}
            </p>
            <p className="text-xs font-bold text-emerald-600 uppercase mt-1">
              Tasks Completed
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 text-center">
            <p className="text-2xl font-black text-sky-700">
              {new Date(worker.joinDate).toLocaleDateString("en-IN", {
                year: "2-digit",
                month: "short",
              })}
            </p>
            <p className="text-xs font-bold text-sky-600 uppercase mt-1">
              Member Since
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFormData(worker);
                setIsEditing(false);
              }}
              className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </motion.div>

      {/* Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Service Guidelines
        </h2>
        <div className="space-y-3">
          {[
            "Always maintain professional conduct with citizens",
            "Follow safety protocols while on field duty",
            "Document photos/evidence for each task",
            "Update task status within agreed timeline",
            "Report any issues to your manager immediately",
          ].map((guideline, i) => (
            <div key={i} className="flex gap-3 text-sm text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                ✓
              </div>
              {guideline}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
