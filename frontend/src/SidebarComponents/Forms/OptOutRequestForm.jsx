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

const OptOutRequestForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showEffectiveFromDateSpinner, setShowEffectiveFromDateSpinner] =
    useState(false);

  const labelStyle = "text-md text-[oklch(0.147_0.004_49.25)] my-1 block";

  const defaultFormData = {
    employee: "",
    enrollmentId: "",
    designation: "",
    date: null,
    accommodation: false,
    transportation: false,
    effectiveFrom: null,
    houseAllowance: false,
    transportationAllowance: false,
    houseNo: "",
    streetName: "",
    buildingName: "",
    area: "",
    country: "",
    zip_pin_code: "",
    landmark: "",
    emergencyContact: "",
    contactNo: "",
    relation: "",
    emergencyContact2: "",
    contactNo2: "",
    relation2: "",

    name_sign: null,
    name_sign_drawn: null,

    approvedBy: null,
    approvedBy_drawn: null,

    concurredBy: null,
    concurredBy_drawn: null,
  };

  const [formData, setFormData] = useState(defaultFormData);
  console.log(formData);

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
    const header = ["Employee", "Date", "Enrollment Id", "Designation"].join(
      "\t",
    );

    const rows = requestData
      .map((item) => {
        return [
          item.employee,
          item.date,
          item.enrollmentId,
          item.designation,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = requestData.map((item) => ({
      Employee: item.employee,
      Date: item.date,
      EnrollmentId: item.enrollmentId,
      Designation: item.designation,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "OptOutRequestFormData");

    XLSX.writeFile(workbook, "OptOutRequestFormData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Employee", "Date", "Enrollment Id", "Designation"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.employee,
        item.date,
        item.enrollmentId,
        item.designation,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("OptOutRequestFormData.pdf");
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
            OPT Out Request Form
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

                  <th className="p-2 font-semibold">Employee Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Enrollment ID
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Designation
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
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

                      <td className="p-2">{item.employee}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.enrollmentId}
                      </td>
                      <td className="p-2 hidden lg:table-cell">
                        {item.designation}
                      </td>

                      <td className="p-2 hidden md:table-cell">{item.date}</td>

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
                  className="max-h-[75vh] max-w-5xl overflow-y-auto pr-2 text-sm"
                  style={{ scrollbarWidth: "none" }}
                >
                  To <br />
                  Human Resource Department <br />
                  Safecor Security
                  <div className="flex flex-row gap-3 mt-4">
                    <label className={`mt-2 ${labelStyle}`}>Dated:</label>
                    <input
                      name="date"
                      value={formData.date || ""}
                      onChange={handleChange}
                      onClick={() => setShowDateSpinner(true)}
                      disabled={mode === "view"}
                      placeholder="dd/mm/yyyy"
                      className="w-full border border-gray-300 px-2 rounded focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
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
                  <div className="text-sm leading-7 space-y-4">
                    {/* Line 1 */}
                    <p>
                      This is to confirm that (name){" "}
                      <span className="inline-block w-40 align-middle mt-1 border border-gray-300 rounded px-2   ">
                        <SearchDropdown
                          name="employee"
                          value={formData.employee}
                          options={["Employee 1", "Employee 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          className=" focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                        />
                      </span>
                      , Holder of employee ID number{" "}
                      <input
                        name="enrollmentId"
                        value={formData.enrollmentId}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-32 mt-1 mx-1 rounded  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                      />
                      , and designation{" "}
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded px-2 w-40 mt-1 mx-1 rounded  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                      />
                      , entitled to a company accommodation and transportation
                      as per my contract of employment with Safecor Security.
                    </p>

                    {/* Line 2 */}
                    <p>
                      I would like to opt out of the Safecor Security provided
                      company{" "}
                      <label className="mx-1 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="mr-1
                       "
                          name="accommodation"
                          value={formData.accommodation}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                        <b>accommodation</b>
                      </label>
                      or/and{" "}
                      <label className="mx-1 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="mr-1"
                          name="transportation"
                          value={formData.transportation}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                        <b>transportation</b>
                      </label>
                      facility (please tick as appropriate) since; I am planning
                      to move to a rented accommodation effective from (date)
                      {/* Date */}
                      <div className="inline-block w-40 align-middle mt-1 mx-2 border border-gray-300 rounded ">
                        <input
                          name="effectiveFrom"
                          value={formData.effectiveFrom || ""}
                          onChange={handleChange}
                          onClick={() => setShowEffectiveFromDateSpinner(true)}
                          disabled={mode === "view"}
                          placeholder="dd/mm/yyyy"
                          className="w-full px-2 rounded focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                        />

                        {showEffectiveFromDateSpinner && (
                          <div className="absolute ">
                            <SpinnerDatePicker
                              value={formData.effectiveFrom}
                              onChange={(date) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  effectiveFrom: date,
                                }))
                              }
                              onClose={() =>
                                setShowEffectiveFromDateSpinner(false)
                              }
                            />
                          </div>
                        )}
                      </div>
                      hence I request you to take back my accommodation or/and
                      transportation (please choose as appropriate) facility
                      allocated to me and grant me my{" "}
                      <label className="mx-1 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="mr-1"
                          name="houseAllowance"
                          value={formData.houseAllowance}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                        <b>House Rent Allowance</b>
                      </label>
                      or/and{" "}
                      <label className="mx-1 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="mr-1"
                          name="transportationAllowance"
                          value={formData.transportationAllowance}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                        <b>Transportation Allowance</b>
                      </label>
                      (please tick as appropriate).
                    </p>

                    {/* Line 3 */}
                    <p>
                      I hereby declares that I am aware of the company policy
                      that I will not be eligible to re-request for company
                      accommodation until completion of one year or earlier at
                      the discretion of the HOS if allocation of units allows.
                      Furthermore, I assume accountability to report on duty
                      without any delay on location assigned to myself. In case
                      of any operational concerns upraised due to my decision, I
                      will be convicted to disciplinary action as company
                      believes appropriate.
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Rented Accommodation */}
                    <div>
                      <h1 className="font-medium">
                        Details of Rented Accommodation
                      </h1>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          House No.
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="houseNo"
                          value={formData.houseNo}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          Street Name & No.
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="streetName"
                          value={formData.streetName}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          Building Name & No.
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="buildingName"
                          value={formData.buildingName}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex flex-row gap-2">
                          <label className={`w-1/2 ${labelStyle}`}>Area</label>
                          <input
                            className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            disabled={mode === "view"}
                          />
                        </div>
                        <div className="flex flex-row gap-2">
                          <label className={`w-1/2 ${labelStyle}`}>
                            Country
                          </label>
                          <input
                            className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            disabled={mode === "view"}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          ZIP/PIN Code
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="zip_pin_code"
                          value={formData.zip_pin_code}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          placeholder="Allow only Numbers"
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label className={`w-1/2 ${labelStyle}`}>
                          Landmark
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                    </div>
                    {/* Emergency Contact Details */}
                    <div>
                      <h1 className="font-medium">Emergency Contact Details</h1>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          Emergency Contact Name -1
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          Contact Number
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="contactNo"
                          value={formData.contactNo}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          type="number"
                          placeholder="Allow only Numbers"
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label className={`w-1/2 ${labelStyle}`}>
                          Relation
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="relation"
                          value={formData.relation}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>

                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          Emergency Contact Name -2
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="emergencyContact2"
                          value={formData.emergencyContact2}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label
                          className={`w-1/2 whitespace-nowrap ${labelStyle}`}
                        >
                          Contact Number
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="contactNo2"
                          value={formData.contactNo2}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          type="number"
                          placeholder="Allow only Numbers"
                        />
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <label className={`w-1/2 ${labelStyle}`}>
                          Relation
                        </label>
                        <input
                          className="w-full border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] "
                          name="relation2"
                          value={formData.relation2}
                          onChange={handleChange}
                          disabled={mode === "view"}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-6">Yours Sincerely,</p>
                  <div className="md:flex md:justify-between ">
                    <div className="flex justify-center mt-6">
                      <div>
                        <input
                          type="file"
                          name="name_sign"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name_sign: e.target.files[0],
                            }))
                          }
                          disabled={mode === "view"}
                          className="border border-gray-400 p-2 w-[230px]"
                        />
                        <SignPad
                          fieldName="name_sign_drawn"
                          name="name_sign"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                        <label className={`${labelStyle} text-center`}>
                          Name and Signature
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-center mt-6">
                      <div>
                        <input
                          type="file"
                          name="approvedBy"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              approvedBy: e.target.files[0],
                            }))
                          }
                          className="border border-gray-400 p-2 w-[230px]"
                          disabled={mode === "view"}
                        />
                        <SignPad
                          fieldName="approvedBy_drawn"
                          name="approvedBy"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                        <label className={`${labelStyle} text-center`}>
                          Approved by <br /> Human Resources Officer
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <div>
                      <input
                        type="file"
                        name="concurredBy"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            concurredBy: e.target.files[0],
                          }))
                        }
                        className="border border-gray-400 p-2 w-[230px]"
                        disabled={mode === "view"}
                      />
                      <SignPad
                        fieldName="concurredBy_drawn"
                        name="concurredBy"
                        formData={formData}
                        setFormData={setFormData}
                        mode={mode}
                      />
                      <label className={`${labelStyle} text-center`}>
                        Concurred by <br /> Managing Director
                      </label>
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

export default OptOutRequestForm;
