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
import axios from "axios";

const API_URL = "http://localhost:3000/api/form/optRequest";

const OptOutRequestForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showEffectiveFromDateSpinner, setShowEffectiveFromDateSpinner] =
    useState(false);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base  rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm xl:text-base  focus:outline-none font-semibold text-gray-700 mb-2 block";

  const defaultFormData = {
    employee: "",
    enrollment_id: "",
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

    nameSignMode: "",
    name_sign: null,
    nameSignPreview: null,
    name_sign_drawn: null,

    approvedByMode: "",
    approvedBy: null,
    approvedBy_drawn: null,
    approvedByPreview: null,

    concurredByMode: "",
    concurredBy: null,
    concurredBy_drawn: null,
    concurredByPreview: null,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setRequestData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const filteredrequestData = requestData.filter((x) =>
    x.employee.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentrequestData = filteredrequestData.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredrequestData.length / entriesPerPage),
  );

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Request Submitted");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(defaultFormData);
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Deleted Successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data");
    }
  };

  const handleCopy = () => {
    const header = ["Employee", "Date", "Enrollment Id", "Designation"].join(
      "\t",
    );

    const rows = filteredrequestData
      .map((item) => {
        return [
          item.employee,
          item.date,
          item.enrollment_id,
          item.designation,
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredrequestData.map((item) => ({
      Employee: item.employee,
      Date: item.date,
      EnrollmentId: item.enrollment_id,
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

    filteredrequestData.forEach((item) => {
      const row = [
        item.employee,
        item.date,
        item.enrollment_id,
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
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center h-[30px] gap-2 text-base xl:text-xl  font-semibold text-gray-900">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Forms</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
          >
            OPT Out Request Form
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData(defaultFormData);
                setOpenModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg xl:text-lg  border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      {!openModal && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl animate-in fade-in duration-500">
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm xl:text-base  font-medium text-gray-600">
                  Show
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm xl:text-base  focus:ring-2 focus:ring-blue-500/60 transition-all"
                >
                  {[10, 25, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <span className="text-sm xl:text-base  font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 p-2.5 rounded-lg transition-all"
                    title="Copy"
                  >
                    <GoCopy className="text-lg xl:text-xl " />
                  </button>
                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 p-2.5 rounded-lg transition-all"
                    title="Excel"
                  >
                    <FaFileExcel className="text-lg xl:text-xl " />
                  </button>
                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-2.5 rounded-lg transition-all"
                    title="PDF"
                  >
                    <FaFilePdf className="text-lg xl:text-xl " />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px]">
              <thead>
                <tr className="bg-slate-50 border-b border-blue-100/50">
                  <th className="py-3 px-6 hidden sm:table-cell font-semibold text-gray-700">
                    SL.No
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 text-center">
                    Employee Name
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Enrollment ID
                  </th>
                  <th className="py-3 px-6 hidden lg:table-cell font-semibold text-gray-700">
                    Designation
                  </th>
                  <th className="py-3 px-6 hidden md:table-cell font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentrequestData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-12 text-center text-gray-500 font-medium"
                    >
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="py-3 px-6 hidden sm:table-cell text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900 text-center">
                        {item.employee}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600 font-mono">
                        {item.enrollment_id}
                      </td>
                      <td className="py-3 px-6 hidden lg:table-cell text-gray-600">
                        {item.designation}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell text-gray-600">
                        {item.date}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 xl:text-xl  cursor-pointer transition-all"
                            title="View"
                          />
                          <FaPen
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 xl:text-xl  cursor-pointer transition-all"
                            title="Edit"
                          />
                          <MdDeleteForever
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 xl:text-xl  cursor-pointer transition-all"
                            title="Delete"
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
          <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-sm xl:text-base  text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {requestData.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, requestData.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {requestData.length}
              </span>{" "}
              entries
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="First page"
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Previous page"
              >
                <GrPrevious />
              </button>

              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                {currentPage}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Next page"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="Last page"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Section */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1300px] max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl   font-bold text-gray-900">
                {mode === "view"
                  ? "Request Details"
                  : mode === "edit"
                    ? "Edit Opt-Out Request"
                    : "New Opt-Out Request"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="border p-6 rounded-xl border-gray-400/40 shadow-sm bg-white">
              <div className="flex justify-center">
                <div
                  className="max-h-[75vh] max-w-5xl overflow-y-auto pr-2 text-[17px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  To <br />
                  <span className="font-bold text-gray-800">
                    Human Resource Department
                  </span>{" "}
                  <br />
                  Safecor Security
                  <div className="flex flex-row items-center gap-3 mt-6">
                    <label
                      className={`font-semibold text-gray-700 whitespace-nowrap`}
                    >
                      Dated:
                    </label>
                    <div className="relative w-48">
                      <input
                        name="date"
                        value={formData.date || ""}
                        onChange={handleChange}
                        onClick={() =>
                          mode !== "view" && setShowDateSpinner(true)
                        }
                        readOnly
                        disabled={mode === "view"}
                        placeholder="dd/mm/yyyy"
                        className="w-full border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      {showDateSpinner && (
                        <div className="absolute z-10">
                          <SpinnerDatePicker
                            value={formData.date}
                            onChange={(date) =>
                              setFormData((prev) => ({ ...prev, date: date }))
                            }
                            onClose={() => setShowDateSpinner(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="leading-8 space-y-6 mt-6 text-gray-700">
                    <p>
                      This is to confirm that (name)
                      <span className="inline-block w-64 align-middle mb-1">
                        <SearchDropdown
                          name="employee"
                          value={formData.employee}
                          options={["Employee 1", "Employee 2"]}
                          formData={formData}
                          setFormData={setFormData}
                          disabled={mode === "view"}
                          inputStyle={`${inputStyle} h-0.5`}
                        />
                      </span>
                      , Holder of employee ID number
                      <input
                        name="enrollment_id"
                        value={formData.enrollment_id}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded-lg px-3 w-40 mx-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      , and designation
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="border border-gray-300 rounded-lg px-3 w-56 mx-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      , entitled to a company accommodation and transportation
                      as per my contract of employment with Safecor Security.
                    </p>

                    <p>
                      I would like to opt out of the Safecor Security provided
                      company
                      <label className="mx-2 inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="accommodation"
                          checked={formData.accommodation}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <b className="text-gray-900">accommodation</b>
                      </label>
                      or/and
                      <label className="mx-2 inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="transportation"
                          checked={formData.transportation}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <b className="text-gray-900">transportation</b>
                      </label>
                      facility (please tick as appropriate) since; I am planning
                      to move to a rented accommodation effective from
                      <div className="inline-block relative mx-2">
                        <input
                          name="effectiveFrom"
                          value={formData.effectiveFrom || ""}
                          onChange={handleChange}
                          onClick={() =>
                            mode !== "view" &&
                            setShowEffectiveFromDateSpinner(true)
                          }
                          readOnly
                          disabled={mode === "view"}
                          placeholder="dd/mm/yyyy"
                          className="w-40 border border-gray-300 px-3 py-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {showEffectiveFromDateSpinner && (
                          <div className="absolute z-10">
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
                      allocated to me and grant me my
                      <label className="mx-2 inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="houseAllowance"
                          checked={formData.houseAllowance}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <b className="text-gray-900">House Rent Allowance</b>
                      </label>
                      or/and
                      <label className="mx-2 inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="transportationAllowance"
                          checked={formData.transportationAllowance}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <b className="text-gray-900">
                          Transportation Allowance
                        </b>
                      </label>
                      (please tick as appropriate).
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 italic text-gray-600 text-sm xl:text-base">
                      I hereby declares that I am aware of the company policy
                      that I will not be eligible to re-request for company
                      accommodation until completion of one year or earlier at
                      the discretion of the HOS if allocation of units allows.
                      Furthermore, I assume accountability to report on duty
                      without any delay on location assigned to myself.
                    </div>
                  </div>
                  {/* Detail Forms Grid */}
                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Rented Accommodation */}
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-gray-200">
                      <h3 className="font-bold text-blue-800 mb-4 border-b pb-2 uppercase tracking-wide">
                        Details of Rented Accommodation
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="w-1/3 font-semibold text-gray-600 text-sm">
                            House No.
                          </label>
                          <input
                            name="houseNo"
                            value={formData.houseNo}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="w-1/3 font-semibold text-gray-600 text-sm">
                            Street Name
                          </label>
                          <input
                            name="streetName"
                            value={formData.streetName}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="w-1/3 font-semibold text-gray-600 text-sm">
                            Building
                          </label>
                          <input
                            name="buildingName"
                            value={formData.buildingName}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-600">
                              Area
                            </label>
                            <input
                              name="area"
                              value={formData.area}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-600">
                              Country
                            </label>
                            <input
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="w-1/3 font-semibold text-gray-600 text-sm">
                            ZIP/PIN Code
                          </label>
                          <input
                            type="number"
                            name="zip_pin_code"
                            value={formData.zip_pin_code}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            placeholder="Numbers only"
                            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="w-1/3 font-semibold text-gray-600 text-sm">
                            Landmark
                          </label>
                          <input
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-gray-200">
                      <h3 className="font-bold text-red-800 mb-4 border-b pb-2 uppercase tracking-wide">
                        Emergency Contact Details
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">
                            Primary Contact
                          </label>
                          <div className="space-y-2">
                            <input
                              name="emergencyContact"
                              value={formData.emergencyContact}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              placeholder="Full Name"
                              className="w-full border-b border-gray-200 pb-1 focus:border-blue-500 outline-none"
                            />
                            <input
                              type="number"
                              name="contactNo"
                              value={formData.contactNo}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              placeholder="Phone Number"
                              className="w-full border-b border-gray-200 pb-1 focus:border-blue-500 outline-none"
                            />
                            <input
                              name="relation"
                              value={formData.relation}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              placeholder="Relation"
                              className="w-full border-b border-gray-200 pb-1 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                          <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">
                            Secondary Contact
                          </label>
                          <div className="space-y-2">
                            <input
                              name="emergencyContact2"
                              value={formData.emergencyContact2}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              placeholder="Full Name"
                              className="w-full border-b border-gray-200 pb-1 focus:border-blue-500 outline-none"
                            />
                            <input
                              type="number"
                              name="contactNo2"
                              value={formData.contactNo2}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              placeholder="Phone Number"
                              className="w-full border-b border-gray-200 pb-1 focus:border-blue-500 outline-none"
                            />
                            <input
                              name="relation2"
                              value={formData.relation2}
                              onChange={handleChange}
                              disabled={mode === "view"}
                              placeholder="Relation"
                              className="w-full border-b border-gray-200 pb-1 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-10 font-medium text-gray-800">
                    Yours Sincerely,
                  </p>
                  <div className="md:flex md:justify-between ">
                    <div className="flex justify-center mt-6">
                      <div>
                        {/* Toggle Tabs — hidden in view mode */}
                        {mode !== "view" && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <label className="block text-sm font-medium mt-1">
                              Signature :
                            </label>
                            <div className="space-x-1 space-y-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    nameSignMode: "upload",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.nameSignMode === "upload"
                                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    nameSignMode: "draw",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.nameSignMode === "draw"
                                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                Sign Here
                              </button>
                            </div>
                          </div>
                        )}
                        {mode === "view" && (
                          <label className="block text-sm font-medium mb-2">
                            Signature :
                          </label>
                        )}

                        {/* Upload Area */}
                        {formData.nameSignMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="nameSignUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    name_sign: file,
                                    nameSignPreview: URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop Zone */}
                            {mode !== "view" && (
                              <label
                                htmlFor="nameSignUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      name_sign: file,
                                      nameSignPreview:
                                        URL.createObjectURL(file),
                                    }));
                                  }
                                }}
                                className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <svg
                                  className="w-8 h-8 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  Drag & drop or{" "}
                                  <span className="text-[#0f172a] font-medium underline">
                                    browse
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, SVG supported
                                </p>
                              </label>
                            )}

                            {/* Preview */}
                            {formData.nameSignPreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.nameSignPreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        name_sign: null,
                                        nameSignPreview: null,
                                      }))
                                    }
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Draw Area */}
                        {formData.nameSignMode === "draw" && (
                          <SignPad
                            fieldName="name_sign_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}

                        <label className="text-sm font-bold text-gray-400 my-2 block border-t w-full text-center pt-2">
                          Name and Signature
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-center mt-6">
                      <div>
                        {/* Toggle Tabs — hidden in view mode */}
                        {mode !== "view" && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <label className="block text-sm font-medium mt-1">
                              Signature :
                            </label>
                            <div className="space-x-1 space-y-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    approvedByMode: "upload",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.approvedByMode === "upload"
                                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    approvedByMode: "draw",
                                  }))
                                }
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  formData.approvedByMode === "draw"
                                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                Sign Here
                              </button>
                            </div>
                          </div>
                        )}
                        {mode === "view" && (
                          <label className="block text-sm font-medium mb-2">
                            Signature :
                          </label>
                        )}

                        {/* Upload Area */}
                        {formData.approvedByMode === "upload" && (
                          <div>
                            <input
                              type="file"
                              id="approvedByUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    approvedBy: file,
                                    approvedByPreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                            />

                            {/* Drag & Drop Zone */}
                            {mode !== "view" && (
                              <label
                                htmlFor="approvedByUpload"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files[0];
                                  if (file && file.type.startsWith("image/")) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      approvedBy: file,
                                      approvedByPreview:
                                        URL.createObjectURL(file),
                                    }));
                                  }
                                }}
                                className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <svg
                                  className="w-8 h-8 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  Drag & drop or{" "}
                                  <span className="text-[#0f172a] font-medium underline">
                                    browse
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, SVG supported
                                </p>
                              </label>
                            )}

                            {/* Preview */}
                            {formData.approvedByPreview && (
                              <div className="mt-4 flex items-center gap-3">
                                <img
                                  src={formData.approvedByPreview}
                                  alt="Signature Preview"
                                  className="h-16 border rounded bg-white p-2 shadow-sm"
                                />
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        approvedBy: null,
                                        approvedByPreview: null,
                                      }))
                                    }
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Draw Area */}
                        {formData.approvedByMode === "draw" && (
                          <SignPad
                            fieldName="approvedBy_drawn"
                            formData={formData}
                            setFormData={setFormData}
                            mode={mode}
                          />
                        )}

                        <label className="text-sm font-bold text-gray-400 my-2 block border-t w-full text-center pt-2">
                          Approved by <br /> Human Resources Officer
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <div>
                      {/* Toggle Tabs — hidden in view mode */}
                      {mode !== "view" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <label className="block text-sm font-medium mt-1">
                            Signature :
                          </label>
                          <div className="space-x-1 space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  concurredByMode: "upload",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.concurredByMode === "upload"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  concurredByMode: "draw",
                                }))
                              }
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                formData.concurredByMode === "draw"
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              Sign Here
                            </button>
                          </div>
                        </div>
                      )}
                      {mode === "view" && (
                        <label className="block text-sm font-medium mb-2">
                          Signature :
                        </label>
                      )}

                      {/* Upload Area */}
                      {formData.concurredByMode === "upload" && (
                        <div>
                          <input
                            type="file"
                            id="concurredByUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  concurredBy: file,
                                  concurredByPreview: URL.createObjectURL(file),
                                }));
                              }
                            }}
                          />

                          {/* Drag & Drop Zone */}
                          {mode !== "view" && (
                            <label
                              htmlFor="concurredByUpload"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    concurredBy: file,
                                    concurredByPreview:
                                      URL.createObjectURL(file),
                                  }));
                                }
                              }}
                              className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                            >
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                                />
                              </svg>
                              <p className="text-sm text-gray-500">
                                Drag & drop or{" "}
                                <span className="text-[#0f172a] font-medium underline">
                                  browse
                                </span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, SVG supported
                              </p>
                            </label>
                          )}

                          {/* Preview */}
                          {formData.concurredByPreview && (
                            <div className="mt-4 flex items-center gap-3">
                              <img
                                src={formData.concurredByPreview}
                                alt="Signature Preview"
                                className="h-16 border rounded bg-white p-2 shadow-sm"
                              />
                              {mode !== "view" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      concurredBy: null,
                                      concurredByPreview: null,
                                    }))
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Draw Area */}
                      {formData.concurredByMode === "draw" && (
                        <SignPad
                          fieldName="concurredBy_drawn"
                          formData={formData}
                          setFormData={setFormData}
                          mode={mode}
                        />
                      )}

                      <label className="text-sm font-bold text-gray-400 my-2 block border-t w-full text-center pt-2">
                        Concurred by <br /> Managing Director
                      </label>
                    </div>
                  </div>
                  {/* Final Action Button */}
                  {mode !== "view" && (
                    <div className="flex justify-end pt-6 border-t">
                      <button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-3 rounded-xl font-bold xl:text-lg  shadow-lg hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                      >
                        Submit Request
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
