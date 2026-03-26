import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import SpinnerDatePicker from "../../SpinnerDatePicker";
import { FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const emptyForm = {
  device_enrollment_id: "",
  company_enrollment_id: "",
  full_name: "",
  mobile: "",
  dob: "",
  doj: "",
  company: "",
  location: "",
  designation: "",
  shift: "",
  leave_plan: "",
  first_approver: "",
  second_approver: "",
  is_manager: false,
  type: "User",
  break_hours_friday: false,
  is_active: false,
  is_mobile_user: false,
  department_id: "",
  designation_id: "",
  shift_id: "",
};

const EmployeeMaster = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [employeeMaster, setEmployeeMaster] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDojPicker, setShowDojPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown options fetched from backend
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);


  const [formData, setFormData] = useState(emptyForm);

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  // ── Fetch employees on mount ──────────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/employee`);
      setEmployeeMaster(res.data);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch dropdown options from backend ───────────────────────────────────
  const fetchDropdowns = async () => {
    try {
      const [deptRes, desRes, shiftRes, appRes] = await Promise.all([
        axios.get(`${API_BASE}/master/departments`),
        axios.get(`${API_BASE}/master/designation`),
        axios.get(`${API_BASE}/master/shifts`),
        axios.get(`${API_BASE}/users/approvers`, { withCredentials: true }),
      ]);
      setDepartmentOptions(deptRes.data || []);
      setDesignationOptions(desRes.data || []);
      setShiftOptions(shiftRes.data || []);
      setApproverOptions(appRes.data || []);

    } catch (error) {
      console.error("Failed to fetch dropdowns", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDropdowns();
  }, []);

  // ── Filtered / paged data ─────────────────────────────────────────────────
  const filteredemployeeMaster = employeeMaster.filter(
    (x) =>
      (x.full_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.location || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.department_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.designation_name || "").toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentemployeeMaster = filteredemployeeMaster.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredemployeeMaster.length / entriesPerPage));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { device_enrollment_id, company_enrollment_id, full_name } = formData;

    if (!device_enrollment_id || !company_enrollment_id || !full_name) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(`${API_BASE}/employee/${editId}`, formData);
        setEmployeeMaster((prev) =>
          prev.map((emp) => (emp.id === editId ? res.data : emp))
        );
        toast.success("Employee updated");
      } else {
        const res = await axios.post(`${API_BASE}/employee`, formData);
        setEmployeeMaster((prev) => [res.data, ...prev]);
        toast.success("Employee added");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/employee/${id}`);
      setEmployeeMaster((prev) => prev.filter((v) => v.id !== id));
      toast.success("Employee deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  // ── Export handlers ───────────────────────────────────────────────────────
  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Device ID",
      "Company ID",
      "Location",
      "Full Name",
      "Shift",
      "Designation",
    ].join("\t");

    const rows = filteredemployeeMaster
      .map((item, index) =>
        [
          index + 1,
          item.device_enrollment_id,
          item.company_enrollment_id,
          item.location,
          item.full_name,
          item.shift_name || item.shift,
          item.designation_name || item.designation,
        ].join("\t")
      )
      .join("\n");

    navigator.clipboard.writeText(`${header}\n${rows}`);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredemployeeMaster.map((item, index) => ({
      "SL.NO": index + 1,
      "Device ID": item.device_enrollment_id,
      "Company ID": item.company_enrollment_id,
      Location: item.location,
      "Full Name": item.full_name,
      Shift: item.shift_name || item.shift,
      Designation: item.designation_name || item.designation,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "EmployeeMaster.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "SL.NO",
      "Device ID",
      "Company ID",
      "Location",
      "Full Name",
      "Shift",
      "Designation",
    ];
    const tableRows = filteredemployeeMaster.map((item, index) => [
      index + 1,
      item.device_enrollment_id,
      item.company_enrollment_id,
      item.location,
      item.full_name,
      item.shift_name || item.shift,
      item.designation_name || item.designation,
    ]);

    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("EmployeeMaster.pdf");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Employee Master
          </div>
        </h1>
        {!openModal && (
          <button
            onClick={() => (
              setMode(""),
              setEditId(null),
              setFormData(emptyForm),
              setOpenModal(true)
            )}
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md whitespace-nowrap"
          >
            + Add New
          </button>
        )}
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
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
              className="border rounded-full px-1 border-[oklch(0.645_0.246_16.439)]"
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
                <th className="p-2 font-semibold hidden sm:table-cell">
                  SL.NO
                </th>
                <th className="p-2 font-semibold">Device ID</th>
                <th className="p-2 font-semibold hidden md:table-cell">
                  Company ID
                </th>
                <th className="p-2 font-semibold hidden lg:table-cell">
                  Location
                </th>
                <th className="p-2 font-semibold">Full Name</th>
                <th className="p-2 font-semibold hidden md:table-cell">
                  Shift
                </th>
                <th className="p-2 font-semibold hidden lg:table-cell">
                  Designation
                </th>
                <th className="p-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="sm:text-center p-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : currentemployeeMaster.length === 0 ? (
                <tr>
                  <td colSpan="8" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentemployeeMaster.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="p-2 hidden sm:table-cell">{startIndex + index + 1}</td>
                    <td className="p-2 ">{item.device_enrollment_id}</td>
                    <td className="p-2  hidden md:table-cell">
                      {item.company_enrollment_id}
                    </td>
                    <td className="p-2  hidden lg:table-cell">
                      {item.location}
                    </td>
                    <td className="p-2 ">{item.full_name}</td>
                    <td className="p-2  hidden md:table-cell">{item.shift_name || item.shift}</td>
                    <td className="p-2 hidden lg:table-cell">
                      {item.designation_name || item.designation}
                    </td>
                    <td className="p-2">
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
                            setFormData({
                              ...item,
                              department_id: item.department_id || "",
                              designation_id: item.designation_id || "",
                              shift_id: item.shift_id || "",
                              department_id_name: item.department_name || "",
                              designation_id_name: item.designation_name || "",
                              shift_id_name: item.shift_name || "",
                            });
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
            Showing {filteredemployeeMaster.length === 0 ? "0" : startIndex + 1}{" "}
            to {Math.min(endIndex, filteredemployeeMaster.length)} of{" "}
            {filteredemployeeMaster.length} entries
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Close */}
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelStyle}>
                  Device EnrollmentID{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="device_enrollment_id"
                  value={formData.device_enrollment_id}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="DeviceID"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Company EnrollmentID{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="company_enrollment_id"
                  value={formData.company_enrollment_id}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="CompanyID"
                  className={inputStyle}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className={labelStyle}>
                  Full Name{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Full Name"
                  className={inputStyle}
                />
              </div>

              {/* Mobile */}
              <div>
                <label className={labelStyle}>Mobile</label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Mobile"
                  className={inputStyle}
                />
              </div>

              {/* Date Of Birth */}
              <div className="relative">
                <label className={labelStyle}>Date Of Birth</label>
                <input
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onClick={() => setShowDobPicker(true)}
                  disabled={mode === "view"}
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showDobPicker && (
                  <SpinnerDatePicker
                    value={formData.dob}
                    onChange={(date) => setFormData({ ...formData, dob: date })}
                    onClose={() => setShowDobPicker(false)}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 border-t pt-4">
              {/* Date Of Join */}
              <div className="relative">
                <label className={labelStyle}>Date Of Join</label>
                <input
                  name="doj"
                  value={formData.doj}
                  onChange={handleChange}
                  onClick={() => setShowDojPicker(true)}
                  disabled={mode === "view"}
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />
                {showDojPicker && (
                  <SpinnerDatePicker
                    value={formData.doj}
                    onChange={(date) => setFormData({ ...formData, doj: date })}
                    onClose={() => setShowDojPicker(false)}
                  />
                )}
              </div>

              {/* Company */}
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={["Company 1", "Company 2"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Location */}
              <div>
                <SearchDropdown
                  label="Location"
                  name="location"
                  value={formData.location}
                  options={[
                    "Location1",
                    "Location2",
                    "Location3",
                    "Location4",
                    "Location5",
                    "Location6",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Department */}
              <div>
                <SearchDropdown
                  label="Department"
                  name="department_id"
                  value={formData.department_id}
                  displayValue={formData.department_id_name}
                  options={departmentOptions}
                  labelKey="name"
                  valueKey="id"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Designation (from backend) */}
              <div>
                <SearchDropdown
                  label="Designation"
                  name="designation_id"
                  value={formData.designation_id}
                  displayValue={formData.designation_id_name}
                  options={designationOptions}
                  labelKey="name"
                  valueKey="id"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Shift (from backend) */}
              <div>
                <SearchDropdown
                  label="Shift"
                  name="shift_id"
                  value={formData.shift_id}
                  displayValue={formData.shift_id_name}
                  options={shiftOptions}
                  labelKey="shift_name"
                  valueKey="id"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Leave Plan */}
              <div>
                <SearchDropdown
                  label="Leave Plan"
                  name="leave_plan"
                  value={formData.leave_plan}
                  options={["Working Days", "Calendar Days"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 border-t pt-4">
              {/* First Approver */}
              <div>
                <SearchDropdown
                  label="First Approver"
                  name="first_approver"
                  value={formData.first_approver}
                  options={approverOptions}
                  labelKey="emp_name"
                  valueKey="emp_name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Second Approver */}
              <div>
                <SearchDropdown
                  label="Second Approver"
                  name="second_approver"
                  value={formData.second_approver}
                  options={approverOptions}
                  labelKey="emp_name"
                  valueKey="emp_name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>


              {/* Manager */}
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>IsManager</label>
                <input
                  type="checkbox"
                  name="is_manager"
                  checked={formData.is_manager}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* Type */}
              <div>
                <label className={labelStyle}>Type</label>
                <div className="flex gap-4 mt-2">
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="Card"
                      checked={formData.type === "Card"}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />{" "}
                    Card
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="User"
                      checked={formData.type === "User"}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />{" "}
                    User
                  </label>
                </div>
              </div>

              {/* Break Hours */}
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Break Hours (Friday)</label>
                <input
                  type="checkbox"
                  name="break_hours_friday"
                  checked={formData.break_hours_friday}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Active</label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* Mobile User */}
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Is Mobile User</label>
                <input
                  type="checkbox"
                  name="is_mobile_user"
                  checked={formData.is_mobile_user}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>
            </div>

            {/* Save */}
            {mode !== "view" && (
              <div className="flex justify-end mt-10">
                <button
                  onClick={handleSubmit}
                  className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMaster;
