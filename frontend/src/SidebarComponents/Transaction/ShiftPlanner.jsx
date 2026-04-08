import React, { useState } from "react";
import EmployeeView from "./EmployeeView";
import CalenderView from "./CalenderView";
import { FaAngleRight } from "react-icons/fa";

const ShiftPlanner = () => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Transaction</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-blue-600">Shift Planner</span>
        </h1>
      </div>

      {/* Container */}
      <div
        className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-y-auto border border-blue-100/50 shadow-xl h-full"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Tabs */}
        <div className="flex gap-6 px-6 pt-6 border-b border-blue-100/30">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`pb-3 text-[16px] xl:text-[20px] font-semibold transition-all relative
          ${
            activeTab === "calendar"
              ? "text-blue-600"
              : "text-gray-500 hover:text-blue-500"
          }`}
          >
            Calendar View
            {activeTab === "calendar" && (
              <div className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("employee")}
            className={`pb-3 text-[16px] xl:text-[20px] font-semibold transition-all relative
          ${
            activeTab === "employee"
              ? "text-blue-600"
              : "text-gray-500 hover:text-blue-500"
          }`}
          >
            Employee View
            {activeTab === "employee" && (
              <div className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "calendar" ? <CalenderView /> : <EmployeeView />}
        </div>
      </div>
    </div>
  );
};

export default ShiftPlanner;
