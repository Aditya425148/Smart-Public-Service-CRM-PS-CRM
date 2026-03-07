import { useState } from "react";
import { motion } from "motion/react";
import { Clock, Edit3, Save, X, Info, AlertTriangle } from "lucide-react";
import { slaConfig } from "../../data/mockData";

export default function AdminSLA() {
  const [configs, setConfigs] = useState(
    slaConfig.map((s, i) => ({ ...s, id: i, editing: false }))
  );
  const [editValues, setEditValues] = useState<Record<number, any>>({});

  const startEdit = (id: number, config: any) => {
    setEditValues({ ...editValues, [id]: { ...config } });
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, editing: true } : c));
  };

  const cancelEdit = (id: number) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, editing: false } : c));
  };

  const saveEdit = (id: number) => {
    setConfigs(prev => prev.map(c =>
      c.id === id ? { ...c, ...editValues[id], editing: false } : c
    ));
  };

  const escalationChain = [
    { level: "Level 1", actor: "Field Officer", trigger: "At SLA deadline (T-0)", action: "Push + SMS notification" },
    { level: "Level 2", actor: "Department Admin", trigger: "T+2 hours after breach", action: "Push + Email notification" },
    { level: "Level 3", actor: "City Admin", trigger: "T+4 hours after breach", action: "Push + Email + SMS notification" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[800] text-slate-900">SLA Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">Configure service level agreements per complaint category</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-[600] text-blue-800">Public SLA Visibility</div>
          <div className="text-xs text-blue-600 mt-0.5">
            Citizens see the SLA deadline for their complaint category at submission time. Changes to SLA apply to new complaints only.
          </div>
        </div>
      </div>

      {/* SLA Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-base font-[700] text-slate-900">SLA Rules by Category</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-[600]">
            Times in hours
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Default SLA</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Escalation SLA</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Emergency SLA</th>
                <th className="text-center px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {configs.map((config) => (
                <motion.tr
                  key={config.id}
                  layout
                  className={`hover:bg-slate-50 transition-colors ${config.editing ? "bg-blue-50/30" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        config.emergencySLA ? "bg-red-500" : "bg-amber-400"
                      }`} />
                      <span className="font-[600] text-slate-800">{config.category}</span>
                    </div>
                  </td>

                  {config.editing ? (
                    <>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          value={editValues[config.id]?.defaultSLA || config.defaultSLA}
                          onChange={e => setEditValues(prev => ({
                            ...prev, [config.id]: { ...prev[config.id], defaultSLA: Number(e.target.value) }
                          }))}
                          className="w-16 text-center text-sm border border-blue-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          value={editValues[config.id]?.escalationSLA || config.escalationSLA}
                          onChange={e => setEditValues(prev => ({
                            ...prev, [config.id]: { ...prev[config.id], escalationSLA: Number(e.target.value) }
                          }))}
                          className="w-16 text-center text-sm border border-blue-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        {config.emergencySLA !== null ? (
                          <input
                            type="number"
                            value={editValues[config.id]?.emergencySLA ?? config.emergencySLA}
                            onChange={e => setEditValues(prev => ({
                              ...prev, [config.id]: { ...prev[config.id], emergencySLA: Number(e.target.value) }
                            }))}
                            className="w-16 text-center text-sm border border-red-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-400 bg-white"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => saveEdit(config.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-[600] rounded-lg transition-colors"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => cancelEdit(config.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-[500] rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-[700] text-slate-800">{config.defaultSLA}h</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-amber-600 font-[700]">{config.escalationSLA}h</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {config.emergencySLA ? (
                          <span className="text-red-600 font-[700] flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {config.emergencySLA}h
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => startEdit(config.id, config)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-[600] rounded-lg transition-colors mx-auto"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation Chain */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-base font-[700] text-slate-900 mb-5">Escalation Chain</h3>
        <div className="space-y-4">
          {escalationChain.map((e, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-[700] ${
                  i === 0 ? "bg-amber-500" : i === 1 ? "bg-orange-500" : "bg-red-500"
                }`}>{i + 1}</div>
                {i < escalationChain.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-[700] text-slate-900">{e.level} — {e.actor}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-[500]">{e.trigger}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{e.action}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          💡 SLA countdown is monitored continuously. T-24h reminder is sent before deadline. Auto-escalation triggers at T-0.
          Citizens can manually escalate from the complaint detail screen when SLA is breached.
        </p>
      </div>
    </div>
  );
}
