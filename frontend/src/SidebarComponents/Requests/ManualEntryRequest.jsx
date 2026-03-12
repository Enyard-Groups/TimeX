import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SpinnerTimePicker from "../SpinnerTimePicker";
import SearchDropdown from "../SearchDropdown";

const MannualEntryRequest = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [mannualEntry, setMannualEntry] = useState(() => {
    const storedData = localStorage.getItem("mannualEntryRequests");

    if (storedData) {
      return JSON.parse(storedData).map((item) => ({
        ...item,
        intime: item.intime ? new Date(item.intime) : null,
        outtime: item.outtime ? new Date(item.outtime) : null,
        createdDate: new Date(item.createdDate),
      }));
    }

    return [
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
      {
        id: 3,
        employee: "Employee 1",
        location: "Head Office",
        intime: new Date("2026-03-02T09:10:00"),
        outtime: new Date("2026-03-02T18:05:00"),
        createdDate: new Date("2026-03-02"),
        remarks: "Late entry",
        status: "Approved",
      },
    ];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);

  useEffect(() => {
    localStorage.setItem("mannualEntryRequests", JSON.stringify(mannualEntry));
  }, [mannualEntry]);

  const [formData, setFormData] = useState({
    employee: "",
    location: "",
    intime: null,
    outtime: null,
    createdDate: new Date(),
    remarks: "",
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredmannualEntry = mannualEntry.filter(
    (x) =>
      x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const lastTransactions = mannualEntry
    .filter((x) => x.employee === formData.employee)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0, 14);

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentmannualEntry = filteredmannualEntry.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredmannualEntry.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle submit
  const handleSubmit = () => {
    const { employee, location, intime, outtime, remarks } = formData;

    if (!employee || !location || !intime || !outtime) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(outtime) <= new Date(intime)) {
      toast.error("Punch Out Time must be after Punch In Time");
      return;
    }

    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];

    const newEntry = {
      id: editId ? editId : Date.now(),
      employee,
      location,
      intime: intime ? new Date(intime).toISOString() : null,
      outtime: outtime ? new Date(outtime).toISOString() : null,
      remarks,
      createdDate: new Date().toISOString(),
      status: "Pending",
    };

    if (editId) {
      const updated = stored.map((item) =>
        item.id === editId ? { ...item, ...newEntry } : item,
      );

      localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

      setMannualEntry(updated);

      // Backend version
      // await axios.put(`/api/manual-entry/${editId}`, newEntry)

      toast.success("Request Updated");
    } else {
      const updated = [...stored, newEntry];

      localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

      setMannualEntry(updated);

      // Backend version
      // await axios.post("/api/manual-entry-request", newEntry)

      toast.success("Request Submitted");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      employee: "",
      location: "",
      intime: null,
      outtime: null,
      createdDate: new Date(),
      remarks: "",
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    const stored =
      JSON.parse(localStorage.getItem("mannualEntryRequests")) || [];

    const updated = stored.filter((v) => v.id !== id);

    localStorage.setItem("mannualEntryRequests", JSON.stringify(updated));

    setMannualEntry(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = [
      "Employee",
      "Location",
      "InTime",
      "OutTime",
      "createdDate",
      "Remarks",
    ].join("\t");

    const rows = filteredmannualEntry
      .map((item) => {
        return [
          item.employee,
          item.location,
          item.intime
            ? new Date(item.intime).toLocaleTimeString([], {
                hour12: false,
              })
            : "",
          item.outtime
            ? new Date(item.outtime).toLocaleTimeString([], {
                hour12: false,
              })
            : "",
          new Date(item.createdDate).toLocaleDateString(),
          item.remarks,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredmannualEntry.map((item) => ({
      Employee: item.employee,
      Location: item.location,
      InTime: item.intime
        ? new Date(item.intime).toLocaleTimeString([], {
            hour12: false,
          })
        : "",
      OutTime: item.outtime
        ? new Date(item.outtime).toLocaleTimeString([], {
            hour12: false,
          })
        : "",
      CreatedDate: new Date(item.createdDate).toLocaleDateString(),
      Remarks: item.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "mannualEntry");

    XLSX.writeFile(workbook, "mannualEntryData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Employee",
      "Location",
      "InTime",
      "OutTime",
      "CreatedDate",
      "Remarks",
    ];

    const tableRows = [];

    filteredmannualEntry.forEach((item) => {
      const row = [
        item.employee,
        item.location,
        item.intime
          ? new Date(item.intime).toLocaleTimeString([], {
              hour12: false,
            })
          : "",
        item.outtime
          ? new Date(item.outtime).toLocaleTimeString([], {
              hour12: false,
            })
          : "",
        new Date(item.createdDate).toLocaleDateString(),
        item.remarks,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("mannualEntryData.pdf");
  };

  return (
    <>
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Requests
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Mannual Entry Request
            </div>
          </h1>
          {!openModal && (
            <button
              onClick={() => setOpenModal(true)}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
            >
              + Add New
            </button>
          )}
        </div>

        <div className="mt-6 bg-white shadow-xl rounded-xl  border border-[oklch(0.8_0.001_106.424)] p-6">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div>
              <label className="mr-2 text-md">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className=" border rounded-full px-1  border-[oklch(0.645_0.246_16.439)]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-2 text-md">entries</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
              />
              <div className="flex">
                <button
                  onClick={handleCopy}
                  className="text-xl px-3 py-1 cursor-pointer text-gray-800"
                >
                  <GoCopy />
                </button>

                <button
                  onClick={handleExcel}
                  className="text-xl px-3 py-1 cursor-pointer text-green-700"
                >
                  <FaFileExcel />
                </button>

                <button
                  onClick={handlePDF}
                  className="text-xl px-3 py-1 cursor-pointer text-red-600"
                >
                  <FaFilePdf />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[250px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="p-2 font-semibold">Emp Name</th>
                  <th className="p-2 font-semibold">Location</th>
                  <th className="p-2 font-semibold">In Time</th>
                  <th className="p-2 font-semibold">Out Time</th>
                  <th className="p-2 font-semibold">Created On</th>
                  <th className="p-2 font-semibold">Requested By</th>
                  <th className="p-2 font-semibold">Remarks</th>
                  <th className="p-2 font-semibold">Status</th>
                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentmannualEntry.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentmannualEntry.map((item) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2">{item.employee}</td>
                      <td className="p-2">{item.location}</td>
                      <td className="p-2">
                        {item.intime
                          ? new Date(item.intime).toLocaleTimeString([], {
                              hour12: false,
                            })
                          : ""}
                      </td>
                      <td className="p-2">
                        {item.outtime
                          ? new Date(item.outtime).toLocaleTimeString([], {
                              hour12: false,
                            })
                          : ""}
                      </td>
                      <td className="p-2">
                        {new Date(item.createdDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">{item.employee}</td>
                      <td className="p-2">{item.remarks}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm
      ${item.status === "Approved" && "bg-green-100 text-green-700"}
      ${item.status === "Rejected" && "bg-red-100 text-red-700"}
      ${item.status === "Pending" && "bg-yellow-100 text-yellow-700"}
    `}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {item.status === "Pending" ? (
                          <div className="flex flex-row space-x-3 justify-center ">
                            {/* View */}
                            <FaEye
                              onClick={() => {
                                setFormData(item);
                                setMode("view");
                                setOpenModal(true);
                              }}
                              className="inline text-blue-500 cursor-pointer text-lg"
                            />

                            {/* Edit */}
                            <FaPen
                              onClick={() => {
                                setFormData(item);
                                setEditId(item.id);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="inline text-green-500 cursor-pointer text-lg"
                            />

                            {/* Delete */}
                            <MdDeleteForever
                              onClick={() => handleDelete(item.id)}
                              className="inline text-red-500 cursor-pointer text-xl"
                            />
                          </div>
                        ) : (
                          "No Action"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
            <span>
              Showing {filteredmannualEntry.length === 0 ? "0" : startIndex + 1}{" "}
              to {Math.min(endIndex, filteredmannualEntry.length)} of{" "}
              {filteredmannualEntry.length} entries
            </span>

            <div className="flex flex-row space-x-1">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrPrevious />
              </button>

              <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
              {/* Close */}
              <div className="flex justify-end">
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <SearchDropdown
                    label={
                      <>
                        Employee <span className="text-red-500">*</span>
                      </>
                    }
                    name="employee"
                    value={formData.employee}
                    options={["Employee 1", "Employee 2", "Employee 3"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                <div>
                  <SearchDropdown
                    label={
                      <>
                        Location <span className="text-red-500">*</span>
                      </>
                    }
                    name="location"
                    value={formData.location}
                    options={["Head Office"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Punch In Time
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <div
                    className={`${inputStyle} cursor-pointer`}
                    onClick={() => {
                      if (mode !== "view") {
                        setShowInTimePicker(true);
                      }
                    }}
                  >
                    {formData.intime
                      ? new Date(formData.intime).toLocaleTimeString([], {
                          hour12: false,
                        })
                      : "HH:MM:SS"}
                  </div>
                  {showInTimePicker && (
                    <SpinnerTimePicker
                      value={formData.intime}
                      onChange={(date) =>
                        setFormData({ ...formData, intime: date })
                      }
                      onClose={() => setShowInTimePicker(false)}
                    />
                  )}
                </div>

                <div>
                  <label className={labelStyle}>
                    Punch Out Time
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <div
                    className={`${inputStyle} cursor-pointer`}
                    onClick={() => {
                      if (mode !== "view") {
                        setShowOutTimePicker(true);
                      }
                    }}
                  >
                    {formData.outtime
                      ? new Date(formData.outtime).toLocaleTimeString([], {
                          hour12: false,
                        })
                      : "HH:MM:SS"}
                  </div>
                  {showOutTimePicker && (
                    <SpinnerTimePicker
                      value={formData.outtime}
                      onChange={(date) =>
                        setFormData({ ...formData, outtime: date })
                      }
                      onClose={() => setShowOutTimePicker(false)}
                    />
                  )}
                </div>

                <div className="lg:col-span-3">
                  <label className={labelStyle}>Remarks</label>
                  <input
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Remarks"
                    className={inputStyle}
                    disabled={mode === "view"}
                    required
                  />
                </div>
              </div>

              {/* Save */}
              {mode !== "view" && (
                <div className="flex justify-end mt-10">
                  <button
                    onClick={handleSubmit}
                    className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md mb-6"
                  >
                    Save
                  </button>
                </div>
              )}

              {formData.employee && (
                <div className="mt-6 rounded-md overflow-hidden">
                  <div className="flex justify-between items-center bg-red-100 px-4 py-2">
                    <span className="font-medium">
                      Last 14 Transactions of the selected User:
                    </span>

                    {mode !== "view" && (
                      <button
                        onClick={handleSubmit}
                        className="bg-gray-100 px-4 py-1 rounded-md"
                      >
                        Submit
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 font-medium">Employee</th>
                          <th className="p-2 font-medium">Date</th>
                          <th className="p-2 font-medium">In Time</th>
                          <th className="p-2 font-medium">Out Time</th>
                          <th className="p-2 font-medium">Location</th>
                        </tr>
                      </thead>

                      <tbody>
                        {lastTransactions.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center p-4">
                              No Previous Transactions
                            </td>
                          </tr>
                        ) : (
                          lastTransactions.map((item) => (
                            <tr key={item.id} className="text-center border-b">
                              <td className="p-2">{item.employee}</td>
                              <td className="p-2">
                                {new Date(
                                  item.createdDate,
                                ).toLocaleDateString()}
                              </td>

                              <td className="p-2">
                                {new Date(item.intime)?.toLocaleTimeString([], {
                                  hour12: false,
                                })}
                              </td>

                              <td className="p-2">
                                {new Date(item.outtime)?.toLocaleTimeString(
                                  [],
                                  {
                                    hour12: false,
                                  },
                                )}
                              </td>

                              <td className="p-2">{item.location}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MannualEntryRequest;
