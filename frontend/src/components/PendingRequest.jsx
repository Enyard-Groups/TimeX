import React from "react";

const PendingRequest = ({
  data = {
    leave: 4,
    wfh: 2,
    claims: 3,
    travel: 1,
  },
}) => {
  const total =
    (data.leave || 0) +
    (data.wfh || 0) +
    (data.claims || 0) +
    (data.travel || 0);

  const items = [
    { label: "Leave", value: data.leave, color: "bg-red-100 text-red-600" },
    { label: "WFH", value: data.wfh, color: "bg-red-100 text-red-600" },
    {
      label: "Claims",
      value: data.claims,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Travel",
      value: data.travel,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="bg-white hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Pending Requests
        </h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
          {total}
        </span>
      </div>

      {/* Items */}
      <div className="w-full gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
          >
            <span className="text-md text-gray-600">{item.label}</span>

            <span
              className={`text-md font-semibold px-2 py-0.5 rounded-full ${item.color}`}
            >
              {item.value || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRequest;
