import { useState } from "react";
import { motion } from "motion/react";
import { Search, Shield, AlertTriangle, Ban, CheckCircle, Eye, MoreHorizontal, Filter } from "lucide-react";

const mockUsers = [
  { id: "USR-001", name: "Rahul Sharma", phone: "+91 98765 43210", tier: 2, reputation: 420, complaints: 18, verified: 15, status: "Active", ward: "Ward 4", badges: 3 },
  { id: "USR-002", name: "Anjali Desai", phone: "+91 87654 32109", tier: 1, reputation: 285, complaints: 12, verified: 10, status: "Active", ward: "Ward 7", badges: 2 },
  { id: "USR-003", name: "Mohammed Farouk", phone: "+91 76543 21098", tier: 1, reputation: 150, complaints: 6, verified: 5, status: "Active", ward: "Ward 2", badges: 1 },
  { id: "USR-004", name: "Priya Singh", phone: "+91 65432 10987", tier: 2, reputation: 380, complaints: 15, verified: 14, status: "Active", ward: "Ward 3", badges: 2 },
  { id: "USR-005", name: "Kiran Patel", phone: "+91 54321 09876", tier: 1, reputation: 90, complaints: 3, verified: 2, status: "Active", ward: "Ward 1", badges: 1 },
  { id: "USR-006", name: "Anonymous User", phone: "N/A", tier: 0, reputation: 20, complaints: 2, verified: 0, status: "Active", ward: "Ward 5", badges: 0 },
  { id: "USR-007", name: "Suresh Nair", phone: "+91 43210 98765", tier: 2, reputation: -10, complaints: 8, verified: 2, status: "Flagged", ward: "Ward 6", badges: 0 },
  { id: "USR-008", name: "Meena Kumari", phone: "+91 32109 87654", tier: 1, reputation: 520, complaints: 22, verified: 20, status: "Active", ward: "Ward 4", badges: 4 },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.ward.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[800] text-slate-900">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor citizens, volunteers, and field officers</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: mockUsers.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Tier 2+ Citizens", value: mockUsers.filter(u => u.tier >= 2).length, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Flagged Accounts", value: mockUsers.filter(u => u.status === "Flagged").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Avg Reputation", value: Math.round(mockUsers.reduce((a, u) => a + u.reputation, 0) / mockUsers.length), color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className={`text-2xl font-[800] ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 font-[500] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or ward..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none text-slate-700 cursor-pointer">
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Flagged">Flagged</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Tier</th>
                <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Reputation</th>
                <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Reports</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Ward</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`hover:bg-slate-50 transition-colors ${user.status === "Flagged" ? "bg-amber-50/30" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-[700] ${
                        user.tier === 0 ? "bg-slate-400" :
                        user.tier === 1 ? "bg-blue-500" : "bg-indigo-600"
                      }`}>
                        {user.name === "Anonymous User" ? "A" : user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-[600] text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.id} · {user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-[700] px-2.5 py-1 rounded-full ${
                      user.tier === 2 ? "bg-indigo-100 text-indigo-700" :
                      user.tier === 1 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      Tier {user.tier}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-[700] ${user.reputation < 0 ? "text-red-600" : user.reputation >= 300 ? "text-emerald-600" : "text-slate-700"}`}>
                      {user.reputation}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-slate-700">{user.complaints}</span>
                    <span className="text-slate-400 text-xs ml-1">({user.verified} verified)</span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-slate-600 font-[500]">{user.ward}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-[600] ${
                      user.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                      user.status === "Flagged" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.status === "Flagged" && "⚠ "}{user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Flag Account"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Suspend Account"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-[700] text-slate-900">User Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg font-[700]">
                {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="text-base font-[700] text-slate-900">{selectedUser.name}</div>
                <div className="text-sm text-slate-500">{selectedUser.id}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-[600]">Tier {selectedUser.tier}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-[600] ${
                    selectedUser.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>{selectedUser.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Reputation", value: selectedUser.reputation },
                { label: "Total Complaints", value: selectedUser.complaints },
                { label: "Verified Reports", value: selectedUser.verified },
                { label: "Badges Earned", value: selectedUser.badges },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-lg font-[800] text-slate-900">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-[600] rounded-xl border border-amber-100 transition-colors">
                <AlertTriangle className="w-4 h-4" /> Flag Account
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-[600] rounded-xl border border-red-100 transition-colors">
                <Ban className="w-4 h-4" /> Suspend
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
