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
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";

const StaffTrainingChecklist = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showInTimePicker, setShowInTimePicker] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);

  const labelStyle = "text-[16px] text-[oklch(0.147_0.004_49.25)] my-1 w-1/2";

  const inputStyle =
    "text-[16px] w-full border border-[oklch(0.923_0.003_48.717)]  bg-white  rounded-md px-3 py-1 text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const defaultFormData = {
    name: "",
    staffId: "",
    schoolName: "",
    shiftTiming: null,
    date: null,

    section: "",
    taskList: "",

    unattendedOk: false,
    unattendedReportedTo: "",

    hazardousOk: false,
    hazardousReportedTo: "",

    iasOk: false,
    iasReportedTo: "",

    gemsAssetsOk: false,
    gemsAssetsReportedTo: "",

    vehicleParkingOk: false,
    vehicleParkingReportedTo: "",

    ptwOk: false,
    ptwReportedTo: "",

    rows: [],

    signature: null,
    signature_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

      toast.success("Request Updated");
    } else {
      const updated = [...requestData, newEntry];
      setRequestData(updated);

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

  const handleAddRow = () => {
    const newRow = {
      section: formData.section,
      taskList: formData.taskList,

      unattendedOk: formData.unattendedOk,
      unattendedReportedTo: formData.unattendedReportedTo,

      hazardousOk: formData.hazardousOk,
      hazardousReportedTo: formData.hazardousReportedTo,

      iasOk: formData.iasOk,
      iasReportedTo: formData.iasReportedTo,

      gemsAssetsOk: formData.gemsAssetsOk,
      gemsAssetsReportedTo: formData.gemsAssetsReportedTo,

      vehicleParkingOk: formData.vehicleParkingOk,
      vehicleParkingReportedTo: formData.vehicleParkingReportedTo,

      ptwOk: formData.ptwOk,
      ptwReportedTo: formData.ptwReportedTo,
    };

    setFormData((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      section: "",
      taskList: "",
      unattendedOk: false,
      unattendedReportedTo: "",
      hazardousOk: false,
      hazardousReportedTo: "",
      iasOk: false,
      iasReportedTo: "",
      gemsAssetsOk: false,
      gemsAssetsReportedTo: "",
      vehicleParkingOk: false,
      vehicleParkingReportedTo: "",
      ptwOk: false,
      ptwReportedTo: "",
    }));
  };

  const handleCopy = () => {
    const header = ["Name", "StaffId", "SchoolName", "ShiftTiming"].join("\t");

    const rows = requestData
      .map((item) => {
        return [
          item.name,
          item.staffId,
          item.schoolName,
          item.shiftTiming,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      Name: item.name,
      StaffId: item.staffId,
      SchoolName: item.schoolName,
      ShiftTiming: item.shiftTiming,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "StaffTrainingChecklistData",
    );

    XLSX.writeFile(workbook, "StaffTrainingChecklistData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Name", "StaffId", "SchoolName", "ShiftTiming"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [item.name, item.staffId, item.schoolName, item.shiftTiming];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("StaffTrainingChecklistData.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Patrolling Checklist
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

                  <th className="p-2 font-semibold">Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Staff Id
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    School Name
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    ShiftTiming
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

                      <td className="p-2">{item.name}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.staffId}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {item.schoolName}
                      </td>

                      <td className="p-2 hidden lg:table-cell">
                        {item.shiftTiming}
                      </td>

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
                  className="max-h-[75vh] max-w-[1200px] overflow-y-auto pr-2 text-[16px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-4 gap-4">
                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Guard Name</label>
                      <div className={inputStyle}>
                        <SearchDropdown
                          name="name"
                          value={formData.name}
                          options={["Employee 1", "Employee 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Staff ID</label>

                      <input
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>School Name</label>

                      <input
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className={inputStyle}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="flex flex-row gap-4">
                      <label className={labelStyle}>Shift Timing</label>
                      <div
                        className={inputStyle}
                        onClick={() => {
                          if (mode !== "view") {
                            setShowInTimePicker(true);
                          }
                        }}
                      >
                        {formData.shiftTiming
                          ? formData.shiftTiming.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : "HH:MM:SS"}
                      </div>
                      {showInTimePicker && (
                        <SpinnerTimePicker
                          value={formData.shiftTiming}
                          onChange={(date) =>
                            setFormData({ ...formData, shiftTiming: date })
                          }
                          onClose={() => setShowInTimePicker(false)}
                        />
                      )}
                    </div>

                    <div className="flex flex-row gap-4 ">
                      <label className={labelStyle}>Date</label>
                      <input
                        name="date"
                        value={formData.date || ""}
                        onChange={handleChange}
                        onClick={() => setShowDateSpinner(true)}
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className={inputStyle}
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

                  <p className="mt-4">
                    *Proceed patrolling in the given order, category wise, If
                    everything is normal during patrolling then tick the "status
                    ok" box, if you find anything wrong then cross the box and
                    report to Manager School Operation /OCC Executive in the
                    Operation Control & command Centre
                  </p>
                  <p>
                    Check all the following categories according to Managing
                    Patrolling at Schools Work instruction(SC001-J3-FO-014) and
                    record details in the Security Log Book (SC001-J3-LB-001)
                  </p>

                  <div className="p-6">
                    {/* ===== TOP FORM ===== */}
                    <div className="border border-gray-400 p-4 mb-6 rounded">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Section */}
                        <div className="flex flex-row">
                          <label className={labelStyle}>Section</label>
                          <div className={inputStyle}>
                            <SearchDropdown
                              name="section"
                              value={formData.section}
                              options={[
                                "Section A - Internal Area",
                                "Section B - Common Area",
                                "Section C - External Area",
                              ]}
                              formData={formData}
                              setFormData={setFormData}
                              disabled={mode === "view"}
                              className={inputStyle}
                            />
                          </div>
                        </div>

                        {/* Task List */}
                        <div className="flex flex-row">
                          <label className={labelStyle}>Task List</label>
                          <div className={inputStyle}>
                            <SearchDropdown
                              name="taskList"
                              value={formData.taskList}
                              options={["Task 1", "Task 2"]}
                              formData={formData}
                              setFormData={setFormData}
                              disabled={mode === "view"}
                            />
                          </div>
                        </div>

                        <div className="flex flex-row gap-6">
                          <label className={labelStyle}>Unattended OK</label>
                          <input
                            type="checkbox"
                            name="unattendedOk"
                            checked={formData.unattendedOk}
                            onChange={handleChange}
                            className="pt-1"
                          />
                        </div>

                        <div className="flex flex-row">
                          <label className={labelStyle}>
                            Unattended Reported to OCC
                          </label>
                          <input
                            name="unattendedReportedTo"
                            value={formData.unattendedReportedTo}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle}`}
                          />
                        </div>

                        <div className="flex flex-row gap-6">
                          <label className={`mt-4 ${labelStyle}`}>
                            Hazardous OK
                          </label>
                          <input
                            type="checkbox"
                            name="hazardousOk"
                            checked={formData.hazardousOk}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="flex flex-row">
                          <label className={labelStyle}>
                            Hazardous Reported to OCC
                          </label>
                          <input
                            name="hazardousReportedTo"
                            value={formData.hazardousReportedTo}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle}`}
                          />
                        </div>

                        <div className="flex flex-row gap-6">
                          <label className={labelStyle}>IAS OK</label>
                          <input
                            type="checkbox"
                            name="iasOk"
                            checked={formData.iasOk}
                            onChange={handleChange}
                            className="pt-1"
                          />
                        </div>

                        <div className="flex flex-row">
                          <label className={labelStyle}>
                            IAS Reported to OCC
                          </label>
                          <input
                            name="iasReportedTo"
                            value={formData.iasReportedTo}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle}`}
                          />
                        </div>

                        <div className="flex flex-row gap-6">
                          <label className={`mt-4 ${labelStyle}`}>
                            Gems Assets OK
                          </label>
                          <input
                            type="checkbox"
                            name="gemsAssetsOk"
                            checked={formData.gemsAssetsOk}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="flex flex-row">
                          <label className={labelStyle}>
                            Gems Assets Reported to OCC
                          </label>
                          <input
                            name="gemsAssetsReportedTo"
                            value={formData.gemsAssetsReportedTo}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle}`}
                          />
                        </div>

                        <div className="flex flex-row gap-6">
                          <label className={labelStyle}>
                            Vehicle Parking OK
                          </label>
                          <input
                            type="checkbox"
                            name="vehicleParkingOk"
                            checked={formData.vehicleParkingOk}
                            onChange={handleChange}
                            className="pt-1"
                          />
                        </div>

                        <div className="flex flex-row">
                          <label className={labelStyle}>
                            Vehicle Parking Reported to OCC
                          </label>
                          <input
                            name="vehicleParkingReportedTo"
                            value={formData.vehicleParkingReportedTo}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle}`}
                          />
                        </div>

                        <div className="flex flex-row gap-6">
                          <label className={`mt-4 ${labelStyle}`}>PTW OK</label>
                          <input
                            type="checkbox"
                            name="ptwOk"
                            checked={formData.ptwOk}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="flex flex-row">
                          <label className={labelStyle}>
                            PTW Reported to OCC
                          </label>
                          <input
                            name="ptwReportedTo"
                            value={formData.ptwReportedTo}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle}`}
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-4 flex gap-4">
                        <button
                          onClick={handleAddRow}
                          className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded"
                        >
                          Add New Row
                        </button>

                        <button
                          onClick={handleClear}
                          className="bg-gray-400 text-white px-4 py-2 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <table className="w-full border border-gray-400 text-center">
                      <thead className="bg-gray-100">
                        {/* TOP HEADER */}
                        <tr>
                          <th className="hidden sm:table-cell p-2">SL No</th>
                          <th className="p-2">Section</th>
                          <th className="p-2">Task</th>

                          <th className="hidden xl:table-cell p-2" colSpan="2">
                            Unattended
                          </th>
                          <th className="hidden xl:table-cell p-2" colSpan="2">
                            Hazardous
                          </th>
                          <th className="hidden xl:table-cell p-2" colSpan="2">
                            IAS
                          </th>
                          <th className="hidden xl:table-cell p-2" colSpan="2">
                            Gems Assets
                          </th>
                          <th className="hidden xl:table-cell p-2" colSpan="2">
                            Vehicle Parking
                          </th>
                          <th className="hidden xl:table-cell p-2" colSpan="2">
                            PTW
                          </th>

                          <th className="p-2">Action</th>
                        </tr>

                        {/* SUB HEADER */}
                        <tr>
                          <th className="hidden sm:table-cell"></th>
                          <th></th>
                          <th></th>

                          <th className="hidden xl:table-cell">OK</th>
                          <th className="hidden xl:table-cell">OCC</th>

                          <th className="hidden xl:table-cell">OK</th>
                          <th className="hidden xl:table-cell">OCC</th>

                          <th className="hidden xl:table-cell">OK</th>
                          <th className="hidden xl:table-cell">OCC</th>

                          <th className="hidden xl:table-cell">OK</th>
                          <th className="hidden xl:table-cell">OCC</th>

                          <th className="hidden xl:table-cell">OK</th>
                          <th className="hidden xl:table-cell">OCC</th>

                          <th className="hidden xl:table-cell">OK</th>
                          <th className="hidden xl:table-cell">OCC</th>

                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {formData.rows.length === 0 ? (
                          <tr>
                            <td colSpan="16" className="p-3 text-[16px]">
                              No Data Available
                            </td>
                          </tr>
                        ) : (
                          formData.rows.map((row, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-300"
                            >
                              <td className="hidden sm:table-cell p-2">
                                {index + 1}
                              </td>

                              <td className="p-2">{row.section}</td>
                              <td className="p-2">{row.taskList}</td>

                              {/* Hidden on small */}
                              <td className="hidden xl:table-cell">
                                {row.unattendedOk ? "OK" : "-"}
                              </td>
                              <td className="hidden xl:table-cell">
                                {row.unattendedReportedTo}
                              </td>

                              <td className="hidden xl:table-cell">
                                {row.hazardousOk ? "OK" : "-"}
                              </td>
                              <td className="hidden xl:table-cell">
                                {row.hazardousReportedTo}
                              </td>

                              <td className="hidden xl:table-cell">
                                {row.iasOk ? "OK" : "-"}
                              </td>
                              <td className="hidden xl:table-cell">
                                {row.iasReportedTo}
                              </td>

                              <td className="hidden xl:table-cell">
                                {row.gemsAssetsOk ? "OK" : "-"}
                              </td>
                              <td className="hidden xl:table-cell">
                                {row.gemsAssetsReportedTo}
                              </td>

                              <td className="hidden xl:table-cell">
                                {row.vehicleParkingOk ? "OK" : "-"}
                              </td>
                              <td className="hidden xl:table-cell">
                                {row.vehicleParkingReportedTo}
                              </td>

                              <td className="hidden xl:table-cell">
                                {row.ptwOk ? "OK" : "-"}
                              </td>
                              <td className="hidden xl:table-cell">
                                {row.ptwReportedTo}
                              </td>

                              {/* Action */}
                              <td className="p-2">
                                <FaEye
                                  className="text-blue-500 cursor-pointer mx-auto text-lg"
                                  onClick={() => {
                                    setViewRow(row);
                                    setOpenViewModal(true);
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {openViewModal && viewRow && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg w-[90%] max-w-xl">
                        <h2 className="text-lg font-bold mb-4">Details</h2>

                        <div className="grid grid-cols-2 gap-3 text-[16px]">
                          <p>
                            <b>Section:</b> {viewRow.section}
                          </p>
                          <p>
                            <b>Task:</b> {viewRow.taskList}
                          </p>

                          <p>
                            <b>Unattended:</b>{" "}
                            {viewRow.unattendedOk ? "OK" : "-"}
                          </p>
                          <p>
                            <b>Unattended OCC:</b>{" "}
                            {viewRow.unattendedReportedTo}
                          </p>

                          <p>
                            <b>Hazardous:</b> {viewRow.hazardousOk ? "OK" : "-"}
                          </p>
                          <p>
                            <b>Hazardous OCC:</b> {viewRow.hazardousReportedTo}
                          </p>

                          <p>
                            <b>IAS:</b> {viewRow.iasOk ? "OK" : "-"}
                          </p>
                          <p>
                            <b>IAS OCC:</b> {viewRow.iasReportedTo}
                          </p>

                          <p>
                            <b>Gems:</b> {viewRow.gemsAssetsOk ? "OK" : "-"}
                          </p>
                          <p>
                            <b>Gems OCC:</b> {viewRow.gemsAssetsReportedTo}
                          </p>

                          <p>
                            <b>Vehicle:</b>{" "}
                            {viewRow.vehicleParkingOk ? "OK" : "-"}
                          </p>
                          <p>
                            <b>Vehicle OCC:</b>{" "}
                            {viewRow.vehicleParkingReportedTo}
                          </p>

                          <p>
                            <b>PTW:</b> {viewRow.ptwOk ? "OK" : "-"}
                          </p>
                          <p>
                            <b>PTW OCC:</b> {viewRow.ptwReportedTo}
                          </p>
                        </div>

                        <div className="text-right mt-4">
                          <button
                            onClick={() => setOpenViewModal(false)}
                            className="bg-red-500 text-white px-4 py-1 rounded"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className=" grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 md:gap-16">
                    <div className="sm:flex sm:flex-row mt-4 ">
                      <label className={labelStyle}>E-signature</label>

                      <input
                        type="file"
                        name="signature"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            signature: e.target.files[0],
                          }))
                        }
                        className="border border-gray-400 h-fit p-1 w-[200px]"
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="sm:flex sm:flex-row ">
                      <h1 className={`mt-4 ${labelStyle}`}>Sign Here</h1>

                      <SignPad
                        fieldName="signature_drawn"
                        name="signature"
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTrainingChecklist;
