import React, { useState } from "react";
import EmployeeView from "./EmployeeView";
import CalenderView from "./CalenderView";
import { FaAngleRight } from "react-icons/fa";

const ShiftPlanner = () => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Transaction
          <FaAngleRight />
          Shift PLanner
        </h1>
      </div>

      <div className="bg-[oklch(1_0_0)] p-6 rounded-xl shadow-sm border border-[oklch(0.923_0.003_48.717)]">
        {/* Tabs */}
        <div className="flex gap-10 border-b border-[oklch(0.923_0.003_48.717)] mb-6">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`pb-3 text-lg font-medium transition-all
          ${
            activeTab === "calendar"
              ? "text-[oklch(0.645_0.246_16.439)] border-b-2 border-[oklch(0.645_0.246_16.439)]"
              : "text-[oklch(0.45_0.004_49.25)]"
          }`}
          >
            Calendar View
          </button>

          <button
            onClick={() => setActiveTab("employee")}
            className={`pb-3 text-lg font-medium transition-all
          ${
            activeTab === "employee"
              ? "text-[oklch(0.645_0.246_16.439)] border-b-2 border-[oklch(0.645_0.246_16.439)]"
              : "text-[oklch(0.45_0.004_49.25)]"
          }`}
          >
            Employee View
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "calendar" ? <CalenderView /> : <EmployeeView />}
      </div>
    </div>
  );
};

export default ShiftPlanner;
