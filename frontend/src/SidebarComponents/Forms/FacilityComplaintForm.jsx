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
import axios from "axios";
import SearchDropdown from "../SearchDropdown";

const API_URL = "http://localhost:3000/api/form/facilityComplaint";

const FacilityComplaintForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading,setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL);
      setRequestData(response.data);
      // console.log(response.data)
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 lg:text-lg 3xl:text-xl rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm";
  const labelStyle =
    "text-sm lg:text-base 3xl:text-xl focus:outline-none font-semibold text-gray-700 mb-2 block";

  const defaultFormData = {
    name: "",
    issue_type: "",
    location: "",
    description: "",
    safety_concerns: "",
    requested_action: "",
    date_noticed: "",
    urgent: "",
    attached_file: null,
    email: "",
    contact: "",
  };
  // console.log("Form Data", formData);

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
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Request Updated");
      } else {
        await axios.post(API_URL, formData);
        console.log(formData);
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
    const header = [
      "name",
      "issue_type ",
      "location",
      "description",
      "safety_concerns",
      "requested_action",
      "date_noticed",
      "urgent",
    ].join("\t");

    const rows = requestData
      .map((item) => {
        return [
          item.name,
          item.issue_type,
          item.location,
          item.description,
          item.safety_concerns,
          item.requested_action,
          item.date_noticed,
          item.urgent,
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
      IssueType: item.issue_type,
      Location: item.location,
      Description: item.description,
      SafetyConcerns: item.safety_concerns,
      RequestedAction: item.requested_action,
      DateNoticed: item.date_noticed,
      Urgent: item.urgent,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "FacilityComplaintFormData",
    );

    XLSX.writeFile(workbook, "FacilityComplaintFormData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "name",
      "Issue_type ",
      "location",
      "description",
      "Safety_concerns",
      "Requested_action",
      "Date_noticed",
      "Urgent",
    ];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [
        item.name,
        item.issue_type,
        item.location,
        item.description,
        item.safety_concerns,
        item.requested_action,
        item.date_noticed,
        item.urgent,
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("FacilityComplaintFormData.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Forms</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            Facility Complaint
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      {!openModal && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
          {/* Top Controls */}
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Display
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    <GoCopy />
                  </button>

                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                    title="Export to Excel"
                  >
                    <FaFileExcel />
                  </button>

                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                    title="Export to PDF"
                  >
                    <FaFilePdf />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[16px] lg:text-[19px] 3xl:text-[22px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                    SL.NO
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Reporter Name
                  </th>
                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    Issue Type
                  </th>
                  <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                    Safety Concern
                  </th>
                  <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                    Requested Action
                  </th>
                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
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
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <p className="text-gray-500 text-lg font-bold ">
                          No complaints recorded
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentrequestData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-6 py-2 text-center hidden sm:table-cell">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-6 py-2 text-center">
                        {item.name || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden md:table-cell">
                        {item.issue_type || "-"}
                      </td>

                      <td className="px-6 py-2 text-center hidden xl:table-cell">
                        {item.location || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden xl:table-cell">
                        {item.description || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden xl:table-cell">
                        {item.safety_concerns || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden xl:table-cell">
                        {item.requested_action || "-"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                              item.urgent
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-green-100 text-green-700 border-green-300"
                            }`}
                          >
                            {item.urgent ? "Urgent" : "Normal"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          {/* View */}
                          <button
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                            title="View"
                          >
                            <FaEye className="text-lg" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FaPen className="text-lg" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <MdDeleteForever className="text-xl" />
                          </button>
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
            <span className="text-sm lg:text-base 3xl:text-xl text-gray-600">
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

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {mode === "view"
                ? "View Complaint"
                : mode === "edit"
                  ? "Edit Complaint"
                  : "Log New Facility Complaint"}
            </h2>

            <div className="space-y-6 mb-8">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date Noticed */}
                <div>
                  <label className={labelStyle}>Date Noticed</label>
                  <input
                    name="date_noticed"
                    value={formData.date_noticed || ""}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    className={inputStyle}
                  />
                </div>

                {/* Reporter Name */}
                <div>
                  <label className={labelStyle}>
                    Reporter Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Full name"
                    className={inputStyle}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="email@example.com"
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Row 2: Contact & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Contact */}
                <div>
                  <label className={labelStyle}>Contact Number</label>
                  <input
                    type="number"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Phone"
                    className={inputStyle}
                  />
                </div>

                {/* Issue Type */}
                <div>
                  <label className={labelStyle}>
                    Issue Category <span className="text-red-500">*</span>
                  </label>
                  <SearchDropdown
                    name="issue_type"
                    value={formData.issue_type}
                    options={[
                      "Electrical",
                      "Plumbing",
                      "Drainage",
                      "Cleaning",
                      "Security",
                      "Other",
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className={labelStyle}>
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Block/Room/Area"
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Row 3: Description & Action */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Description */}
                <div>
                  <label className={labelStyle}>Issue Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    rows={4}
                    placeholder="Details of the issue..."
                    className={inputStyle}
                  />
                </div>

                {/* Requested Action */}
                <div>
                  <label className={labelStyle}>
                    Requested Action / Solution
                  </label>
                  <textarea
                    name="requested_action"
                    value={formData.requested_action}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    rows={4}
                    placeholder="What fix is needed?"
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Row 4: Safety & File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Safety Concerns */}
                <div>
                  <label className={labelStyle}>Safety Concerns</label>
                  <SearchDropdown
                    name="safety_concerns"
                    value={formData.safety_concerns}
                    options={["Yes", "No"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className={labelStyle}>Attachment / Evidence</label>
                  <input
                    type="file"
                    name="attachedFile"
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Urgent Checkbox */}
              <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100 w-fit">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className="w-5 h-5 cursor-pointer accent-red-500 disabled:cursor-not-allowed"
                />
                <label className="text-gray-700 font-semibold cursor-pointer">
                  Mark as Urgent Issue
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            {mode !== "view" && (
              <div className="flex justify-end gap-3 pt-6 border-t border-blue-100/30">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  {editId ? "Update Complaint" : "Submit Complaint"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityComplaintForm;
