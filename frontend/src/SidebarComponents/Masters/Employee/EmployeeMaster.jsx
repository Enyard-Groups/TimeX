import React, { useState } from "react";
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

  const [formData, setFormData] = useState({
    deviceEnrollmentId: "",
    companyEnrollmentId: "",
    fullName: "",
    mobile: "",
    dob: "",
    doj: "",
    company: "",
    location: "",
    designation: "",
    shift: "",
    leavePlan: "",
    firstApprover: "",
    secondApprover: "",
    isManager: false,
    type: "User",
    breakHoursFriday: false,
    active: false,
    isMobileUser: false,
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredemployeeMaster = employeeMaster.filter(
    (x) =>
      x.fullName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentemployeeMaster = filteredemployeeMaster.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredemployeeMaster.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const { deviceEnrollmentId, companyEnrollmentId, fullName } = formData;

    if (!deviceEnrollmentId || !companyEnrollmentId || !fullName) {
      toast.error("Please fill required fields");
      return;
    }

    if (editId) {
      setEmployeeMaster((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setEmployeeMaster((prev) => [...prev, { id: Date.now(), ...formData }]);
      toast.success("Data added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      deviceEnrollmentId: "",
      companyEnrollmentId: "",
      fullName: "",
      mobile: "",
      dob: "",
      doj: "",
      company: "",
      location: "",
      designation: "",
      shift: "",
      leavePlan: "",
      firstApprover: "",
      secondApprover: "",
      isManager: false,
      type: "User",
      breakHoursFriday: false,
      active: false,
      isMobileUser: false,
    });
  };

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
          item.deviceEnrollmentId,
          item.companyEnrollmentId,
          item.location,
          item.fullName,
          item.shift,
          item.designation,
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredemployeeMaster.map((item, index) => ({
      "SL.NO": index + 1,
      "Device ID": item.deviceEnrollmentId,
      "Company ID": item.companyEnrollmentId,
      Location: item.location,
      "Full Name": item.fullName,
      Shift: item.shift,
      Designation: item.designation,
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

    const tableRows = [];

    filteredemployeeMaster.forEach((item, index) => {
      const row = [
        index + 1,
        item.deviceEnrollmentId,
        item.companyEnrollmentId,
        item.location,
        item.fullName,
        item.shift,
        item.designation,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("EmployeeMaster.pdf");
  };

  return (
    <div className="mb-16">
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
              setFormData({
                deviceEnrollmentId: "",
                companyEnrollmentId: "",
                fullName: "",
                mobile: "",
                dob: "",
                doj: "",
                company: "",
                location: "",
                designation: "",
                shift: "",
                leavePlan: "",
                firstApprover: "",
                secondApprover: "",
                isManager: false,
                type: "User",
                breakHoursFriday: false,
                active: false,
                isMobileUser: false,
              }),
              setOpenModal(true)
            )}
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
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
              {currentemployeeMaster.length === 0 ? (
                <tr>
                  <td colSpan="12" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentemployeeMaster.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="p-2 hidden sm:table-cell">{index + 1}</td>

                    <td className="p-2 ">{item.deviceEnrollmentId}</td>

                    <td className="p-2  hidden md:table-cell">
                      {item.companyEnrollmentId}
                    </td>

                    <td className="p-2  hidden lg:table-cell">
                      {item.location}
                    </td>

                    <td className="p-2 ">{item.fullName}</td>

                    <td className="p-2  hidden md:table-cell">{item.shift}</td>

                    <td className="p-2 hidden lg:table-cell">
                      {item.designation}
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
                            setFormData(item);
                            setEditId(item.id);
                            setMode("edit");
                            setOpenModal(true);
                          }}
                          className="inline text-green-500 cursor-pointer text-lg"
                        />

                        {/* Delete */}
                        <MdDeleteForever
                          onClick={() =>
                            setEmployeeMaster(
                              employeeMaster.filter((v) => v.id !== item.id),
                            )
                          }
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
                  name="deviceEnrollmentId"
                  value={formData.deviceEnrollmentId}
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
                  name="companyEnrollmentId"
                  value={formData.companyEnrollmentId}
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
                  name="fullName"
                  value={formData.fullName}
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

              {/* Designation */}
              <div>
                <SearchDropdown
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  options={[
                    "Banking Officer",
                    "Service Sales manager",
                    "Finance Assistant",
                    "Trade Finance Specialist",
                    "Sales Support Officer",
                    "General",
                    "HR manager",
                    "HR Supervisor",
                    "HR Specialist",
                    "Facilities Manager",
                    "Project Manager",
                    "Team Lead – Operations",
                    "Driver",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Shift */}
              <div>
                <SearchDropdown
                  label="Shift"
                  name="shift"
                  value={formData.shift}
                  options={["Morning", "Evening", "Night", "General"]}
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
                  name="leavePlan"
                  value={formData.leavePlan}
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
                  name="firstApprover"
                  value={formData.firstApprover}
                  options={["Name 1", "Name 2"]}
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
                  name="secondApprover"
                  value={formData.secondApprover}
                  options={["Name 1", "Name 2"]}
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
                  name="isManager"
                  checked={formData.isManager}
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
                  name="breakHoursFriday"
                  checked={formData.breakHoursFriday}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Active</label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              {/* Mobile User */}
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Is Mobile User</label>
                <input
                  type="checkbox"
                  name="isMobileUser"
                  checked={formData.isMobileUser}
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
