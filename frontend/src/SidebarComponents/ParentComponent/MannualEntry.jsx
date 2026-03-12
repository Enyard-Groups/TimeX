import React, { useState } from "react";
import MannualEntryRequest from "./MannualEntryRequest";
import MannualEntryApproval from "./MannualEntryApproval";

const ManualEntryPage = () => {
  const [mannualEntry, setMannualEntry] = useState([
    {
      id: 1,
      employee: "Employee 1",
      location: "Head Office",
      intime: new Date("2026-03-01T09:00:00"),
      outtime: new Date("2026-03-01T18:00:00"),
      createdDate: new Date("2026-03-01"),
      remarks: "Normal shift",
      status: "Pending",
    },
    {
      id: 2,
      employee: "Employee 1",
      location: "Head Office",
      intime: new Date("2026-03-02T09:10:00"),
      outtime: new Date("2026-03-02T18:05:00"),
      createdDate: new Date("2026-03-02"),
      remarks: "Late entry",
      status: "Pending",
    },
  ]);

  return (
    <>
      <MannualEntryRequest
        mannualEntry={mannualEntry}
        setMannualEntry={setMannualEntry}
      />

      <MannualEntryApproval
        mannualEntry={mannualEntry}
        setMannualEntry={setMannualEntry}
      />
    </>
  );
};

export default ManualEntryPage;
