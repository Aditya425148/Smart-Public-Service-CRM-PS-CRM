import React from "react";
import { STATE_DATA } from "../data/mockData";
import delhiIcon from "../assets/delhi-icon.svg";

const PLUS_PATTERN =
  "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20d%3D%22M12%204v16M4%2012h16%22%20stroke%3D%22white%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20opacity%3D%220.15%22%2F%3E%3C%2Fsvg%3E')]";

const stateIcons = { delhi: delhiIcon };

const StateSelectionView = ({ onSelectState }) => {
  const stateKeys = Object.keys(STATE_DATA);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-xs text-[#5f6b63] uppercase tracking-[0.2em] mb-6">
        PORTAL / STATE OVERVIEW
      </p>

      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          <span className="text-[#1f2937]">State </span>
          <span className="text-[#ff9933]">Administration </span>
          <span className="text-[#1f2937]">Overview</span>
        </h1>
        <p className="text-sm text-[#5f6b63] mt-2">
          Select a state to view managers, field officers, and active project
          assignments
        </p>
      </div>

      {/* State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stateKeys.map((key) => {
          const state = STATE_DATA[key];
          const isRed = state.color === "red";

          return (
            <div
              key={key}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* ── Top Banner ── */}
              <div
                className={`relative h-40 flex flex-col items-center justify-center cursor-pointer ${
                  isRed
                    ? "bg-gradient-to-br from-[#ef4444] to-[#dc2626]"
                    : "bg-gradient-to-br from-[#3b82f6] to-[#2563eb]"
                }`}
                onClick={() => onSelectState(key)}
              >
                {/* Plus / cross pattern overlay */}
                <div
                  className={`absolute inset-0 bg-repeat pointer-events-none ${PLUS_PATTERN}`}
                />

                {/* State map watermark */}
                <img
                  src={stateIcons[key]}
                  alt=""
                  className="absolute bottom-2 right-3 w-24 h-24 object-contain opacity-30 pointer-events-none select-none"
                  style={{ filter: "brightness(0) invert(1)" }}
                />

                <h2 className="relative z-10 text-3xl font-bold italic text-white drop-shadow-md">
                  {state.label}
                </h2>
                <p className="relative z-10 text-sm text-white/60 mt-1">
                  {state.hindiLabel}
                </p>
              </div>

              <div className="bg-white grid grid-cols-4 divide-x divide-gray-50 border-t border-gray-50">
                <div className="flex flex-col items-center justify-center py-5">
                  <div className="text-2xl font-bold text-gray-800">
                    {state.managers}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                    Managers
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-5">
                  <div className="text-2xl font-bold text-gray-800">
                    {state.workers}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                    Workers
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-5">
                  <div className="text-2xl font-bold text-gray-800">
                    {state.projects}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                    Projects
                  </div>
                </div>
                <div className="flex items-center justify-center py-5">
                  <button
                    onClick={() => onSelectState(key)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isRed
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-blue-50 text-blue-500 hover:bg-blue-100"
                    }`}
                  >
                    View →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StateSelectionView;
