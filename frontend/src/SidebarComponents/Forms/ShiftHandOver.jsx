/* eslint-disable no-unused-vars */
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
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";

const ShiftHandOver = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);

  const labelStyle = "text-md text-[oklch(0.147_0.004_49.25)] my-1 block";

  const defaultFormData = {
    schoolname: "",
    timeIn: null,
    timeOut: null,
    date: null,

    guardOut: "",
    guardIn: "",
    idOut: "",
    idIn: "",
    securityRemark: "",
    maintenanceRemark: "",
    staffIssueRemark: "",
    lostFoundRemark: "",
    proceduresRemark: "",
    managementRemark: "",
    damageRemark: "",
    interestRemark: "",
    radios: "",
    tourSystem: "",
    dutyMobile: "",
    keys: "",
    preparedBySign: null,
    preparedBySign_drawn: null,
    acknowlegedBySign: null,
    acknowlegedBySign_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const detailsFields = [
    {
      label: "Special Events Safety And Security Issues",
      name: "securityRemark",
    },
    { label: "Maintenance Work", name: "maintenanceRemark" },
    { label: "Staff Issues", name: "staffIssueRemark" },
    {
      label: "Incident/Accident Report / Lost and Found (If Any)",
      name: "lostFoundRemark",
    },
    {
      label: "New Instructions Or Changes In Work Procedures",
      name: "proceduresRemark",
    },
    {
      label:
        "Special Assignments Instructions From School or Security Management",
      name: "managementRemark",
    },
    { label: "Damaged / Lost key details if any", name: "damageRemark" },
    {
      label: "Other Items of Interest (Fire panel, property damage, etc.)",
      name: "interestRemark",
    },
  ];

  const equipmentFields = [
    { label: "Radios", name: "radios" },
    { label: "Guard Tour System", name: "tourSystem" },
    { label: "Duty Mobile", name: "dutyMobile" },
    { label: "Keys", name: "keys" },
  ];

  const handleChange = (e, section = null, subsection = null) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (section && subsection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [name]: type === "checkbox" ? checked : value,
            },
          },
        };
      }

      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === "checkbox" ? checked : value,
          },
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentrequestData = requestData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(requestData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = () => {
    const newEntry = {
      id: editId ? editId : Date.now(),
      ...formData,
    };

    if (editId) {
      const updated = requestData.map((item) =>
        item.id === editId ? { ...item, ...newEntry } : item,
      );

      setRequestData(updated);

      // Backend version
      // await axios.put(`/api/manual-entry/${editId}`, newEntry)

      toast.success("Request Updated");
    } else {
      const updated = [...requestData, newEntry];
      setRequestData(updated);

      // Backend version
      // await axios.post("/api/manual-entry-request", newEntry)

      toast.success("Request Submitted");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData(defaultFormData);
  };

  // Handle delete
  const handleDelete = (id) => {
    const updated = requestData.filter((v) => v.id !== id);

    setRequestData(
      updated.map((item) => ({
        ...item,
      })),
    );

    toast.success("Deleted Successfully");
  };

  const handleCopy = () => {
    const header = ["School Name", "Time In", "Time Out", "Date"].join("\t");

    const rows = requestData
      .map((item) => {
        return [item.schoolname, item.timeIn, item.timeOut, item.date].join(
          "\t",
        );
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      SchoolName: item.schoolname,
      TimeIn: item.timeIn,
      TimeOut: item.timeOut,
      Date: item.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "ShiftHandOverData");

    XLSX.writeFile(workbook, "ShiftHandOverData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["School Name", "Time In", "Time Out", "Date"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [item.schoolname, item.timeIn, item.timeOut, item.date];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ShiftHandOverData.pdf");
  };

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Shift Hand Over
          </div>
        </h1>
        {!openModal && (
          <button
            onClick={() => (
              setMode(""),
              setEditId(null),
              setFormData(defaultFormData),
              setOpenModal(true)
            )}
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
          >
            + Add New
          </button>
        )}
      </div>

      {!openModal && (
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
                  <th className="p-2 font-semibold hidden sm:table-cell">
                    SL.No
                  </th>

                  <th className="p-2 font-semibold">School Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Time In
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Time Out
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Date
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentrequestData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 whitespace-nowrap hidden sm:table-cell">
                        {index + 1}
                      </td>

                      <td className="p-2">{item.schoolname}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.timeIn}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {item.timeOut}
                      </td>

                      <td className="p-2 hidden lg:table-cell">{item.date}</td>

                      <td className="p-2 flex flex-row space-x-3 justify-center whitespace-nowrap">
                        {" "}
                        <div className="flex flex-row space-x-3 justify-center mt-1">
                          {/* View */}{" "}
                          <FaEye
                            onClick={() => {
                              setFormData(item);

                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />{" "}
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
              Showing {requestData.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, requestData.length)} of {requestData.length}{" "}
              entries
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
      )}

      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-[1500px] max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close */}
            <div className="flex justify-end mb-4">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="border p-4 rounded-xl border-gray-400 shadow">
              <div className="flex justify-center">
                <div
                  className="max-h-[75vh] max-w-[1200px] overflow-y-auto pr-2 text-sm"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-row">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        School Name
                      </label>
                      <input
                        type="text"
                        name="schoolname"
                        value={formData.schoolname}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 px-2 w-30 sm:w-40 mt-1 mx-1   focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                      />
                    </div>
                    <div className="flex flex-row">
                      <label className={labelStyle}>Date</label>
                      <input
                        name="date"
                        value={formData.date || ""}
                        onChange={handleChange}
                        onClick={() => setShowDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className="sm:w-full mx-1 border border-gray-300 px-2  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                      />

                      {showDateSpinner && (
                        <div className="absolute mt-10 ml-8 sm:ml-14 md:ml-16 lg:ml-20  ">
                          <SpinnerDatePicker
                            value={formData.date}
                            onChange={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                date: date,
                              }))
                            }
                            onClose={() => setShowDateSpinner(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="my-2">
                    * Make sure that handover note is signed by both parties
                  </p>
                  {/* Shift Section */}
                  <table className="w-full border border-gray-400 mb-6">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-1">Shift</th>
                        <th className="border border-gray-400 p-1">Outgoing</th>
                        <th className="border border-gray-400 p-1">Incoming</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 font-semibold p-1">
                          Timing
                        </td>
                        <td className="border border-gray-400">
                          <div
                            className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] cursor-pointer text-center"
                            onClick={() => {
                              if (mode !== "view") {
                                setShowOutTimePicker(true);
                              }
                            }}
                          >
                            {formData.timeOut
                              ? formData.timeOut.toLocaleTimeString([], {
                                  hour12: false,
                                })
                              : "HH:MM:SS"}
                          </div>
                          {showOutTimePicker && (
                            <SpinnerTimePicker
                              value={formData.timeOut}
                              onChange={(date) =>
                                setFormData({ ...formData, timeOut: date })
                              }
                              onClose={() => setShowOutTimePicker(false)}
                            />
                          )}
                        </td>
                        <td className="border border-gray-400">
                          <div
                            className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]  cursor-pointer text-center"
                            onClick={() => {
                              if (mode !== "view") {
                                setShowInTimePicker(true);
                              }
                            }}
                          >
                            {formData.timeIn
                              ? formData.timeIn.toLocaleTimeString([], {
                                  hour12: false,
                                })
                              : "HH:MM:SS"}
                          </div>
                          {showInTimePicker && (
                            <SpinnerTimePicker
                              value={formData.timeIn}
                              onChange={(date) =>
                                setFormData({ ...formData, timeIn: date })
                              }
                              onClose={() => setShowInTimePicker(false)}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 font-semibold border-gray-400">
                          Head Guard / Guard Name
                        </td>
                        <td className="border border-gray-400">
                          <input
                            type="text"
                            name="guardOut"
                            value={formData.guardOut}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-full p-1  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          />
                        </td>
                        <td className="border border-gray-400">
                          <input
                            type="text"
                            name="guardIn"
                            value={formData.guardIn}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-full p-1  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-1 font-semibold border-gray-400">
                          ID Number
                        </td>
                        <td className="border border-gray-400">
                          <input
                            type="number"
                            name="idOut"
                            value={formData.idOut}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-full p-1  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                            placeholder="Allow only Numbers"
                          />
                        </td>
                        <td className="border border-gray-400">
                          <input
                            type="number"
                            name="idIn"
                            value={formData.idIn}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-full p-1  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                            placeholder="Allow only Numbers"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Details Section */}
                  <table className="w-full border border-gray-400 mb-6">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-1 w-1/2">
                          Description
                        </th>
                        <th className="border border-gray-400 p-1 w-1/2">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsFields.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-400 p-1">
                            {item.label}
                          </td>
                          <td className="border border-gray-400 px-1 pt-1">
                            <textarea
                              name={item.name}
                              value={formData[item.name]}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Equipment Section */}
                  <table className="w-full border border-gray-400">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-1">
                          Security Equipment
                        </th>
                        <th className="border border-gray-400 p-1">
                          Status / Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentFields.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-400 p-1">
                            {item.label}
                          </td>
                          <td className="border border-gray-400 p-1">
                            <input
                              name={item.name}
                              value={formData[item.name]}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid grid-cols-1 md:grid-cols-2 mt-4">
                    <div>
                      <label className={`${labelStyle} bg-gray-100 p-2 w-fit`}>
                        E-Signature
                      </label>
                      <div className="flex flex-col">
                        <input
                          type="file"
                          name="preparedBySign"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              preparedBySign: e.target.files[0],
                            }))
                          }
                          className="border border-gray-400 p-1 w-[200px]"
                          disabled={mode === "view"}
                        />
                        <SignPad
                          fieldName="preparedBySign_drawn"
                          name="preparedBySign"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`${labelStyle} bg-gray-100 p-2 w-fit`}>
                        E-Signature
                      </label>
                      <div className="flex flex-col">
                        <input
                          type="file"
                          name="acknowlegedBySign"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              acknowlegedBySign: e.target.files[0],
                            }))
                          }
                          className="border border-gray-400 p-1 w-[200px]"
                          disabled={mode === "view"}
                        />
                        <SignPad
                          fieldName="acknowlegedBySign_drawn"
                          name="acknowlegedBySign"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHandOver;
