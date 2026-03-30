import React, { useState, useEffect } from "react";
import axios from "axios";
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
import SearchDropdown from "../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const emptyForm = {
  employee_id: "",
  claim_category: "",
  date: "",
  amount: "",
  purpose: "",
  remarks: "",
  status: "Pending",
};

const ClaimRequest = () => {
  const [mode, setMode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [claims, setClaims] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateSpinner, setDateSpinner] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [claimsRes, empRes, catRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/claim`),
        axios.get(`${API_BASE}/employee`),
        axios.get(`${API_BASE}/master/claim-categories`),
      ]);
      setClaims(claimsRes.data);
      setEmployeeOptions(empRes.data);
      setCategoryOptions(catRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { employee_id, claim_category, date, amount, purpose } = formData;

    if (!employee_id || !claim_category || !date || !amount || !purpose) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/claim/${editId}`,
          formData,
        );
        setClaims((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  ...res.data,
                  employee_name: employeeOptions.find(
                    (e) => e.id === employee_id,
                  )?.full_name,
                }
              : item,
          ),
        );
        toast.success("Updated Successfully");
      } else {
        const res = await axios.post(`${API_BASE}/requests/claim`, formData);
        setClaims((prev) => [
          {
            ...res.data,
            employee_name: employeeOptions.find((e) => e.id === employee_id)
              ?.full_name,
          },
          ...prev,
        ]);
        toast.success("Submitted Successfully");
      }

      setOpenModal(false);
      setEditId(null);
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await axios.delete(`${API_BASE}/requests/claim/${id}`);
        setClaims((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Delete failed");
      }
    }
  };

  const filteredClaims = claims.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.claim_category || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentClaims = filteredClaims.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredClaims.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "Category",
      "Date",
      "Amount",
      "Purpose",
      "Created Date",
    ].join("\t");
    const rows = filteredClaims
      .map((item) =>
        [
          item.employee_name,
          item.claim_category,
          item.date,
          item.amount,
          item.purpose,
          new Date(item.created_at).toLocaleDateString(),
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredClaims.map((item) => ({
      Employee: item.employee_name,
      Category: item.claim_category,
      Date: item.date,
      Amount: item.amount,
      Purpose: item.purpose,
      CreatedDate: new Date(item.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ClaimRequest");
    XLSX.writeFile(workbook, "ClaimRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "Employee",
      "Category",
      "Date",
      "Amount",
      "Purpose",
      "Created Date",
    ];
    const tableRows = filteredClaims.map((item) => [
      item.employee_name,
      item.claim_category,
      item.date,
      item.amount,
      item.purpose,
      new Date(item.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ClaimRequestData.pdf");
  };

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";
  const labelStyle = "text-lg font-medium mb-1 block";

  return (
    <div className="mb-6">
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Requests
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Claim Request
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData(emptyForm);
                setOpenModal(true);
              }}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-6">
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
              className="shadow-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
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

        <div
          className="overflow-x-auto min-h-[250px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold">Employee</th>
                <th className="py-2 px-6 font-semibold hidden sm:table-cell">
                  Category
                </th>
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">
                  Date
                </th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">
                  Amount
                </th>
                <th className="py-2 px-6 font-semibold">Status</th>
                <th className="py-2 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentClaims.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6">{item.employee_name}</td>
                    <td className="py-2 px-6 hidden sm:table-cell">
                      {item.claim_category}
                    </td>
                    <td className="py-2 px-6 hidden lg:table-cell">
                      {item.date}
                    </td>
                    <td className="py-2 px-6 hidden xl:table-cell">
                      {item.amount}
                    </td>
                    <td className="py-2 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2 justify-center">
                        <FaEye
                          onClick={() => {
                            setFormData(item);
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="text-blue-500 cursor-pointer text-lg mt-2 mr-2"
                        />
                        {item.status === "Pending" && (
                          <>
                            <FaPen
                              onClick={() => {
                                setEditId(item.id);
                                setFormData(item);
                                setMode("edit");
                                setOpenModal(true);
                              }}
                              className="text-green-600 cursor-pointer text-lg mt-2 mr-2"
                            />
                            <MdDeleteForever
                              onClick={() => handleDelete(item.id)}
                              className="text-red-500 cursor-pointer text-2xl mt-1.5"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
          <span>
            Showing {filteredClaims.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredClaims.length)} of{" "}
            {filteredClaims.length} entries
          </span>
          <div className="flex flex-row space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
            >
              <GrPrevious />
            </button>
            <div className="p-3 px-4 shadow rounded-full">{currentPage}</div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-3 bg-gray-200 rounded-full disabled:opacity-50"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 text-[oklch(0.147_0.004_49.25)] overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SearchDropdown
                  label={
                    <>
                      Employee <span className="text-red-500">*</span>
                    </>
                  }
                  name="employee_id"
                  value={formData.employee_id}
                  displayValue={formData.employee_name || ""}
                  options={employeeOptions}
                  labelKey="full_name"
                  valueKey="id"
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
                      Claim Category <span className="text-red-500">*</span>
                    </>
                  }
                  name="claim_category"
                  value={formData.claim_category}
                  options={categoryOptions}
                  labelKey="name"
                  valueKey="name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="date"
                    value={formData.date}
                    onClick={() => mode !== "view" && setDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    readOnly
                    className={`${inputStyle} cursor-pointer`}
                  />
                  {dateSpinner && (
                    <SpinnerDatePicker
                      value={formData.date}
                      onChange={(date) =>
                        setFormData({ ...formData, date: date })
                      }
                      onClose={() => setDateSpinner(false)}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyle}>
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={inputStyle}
                  placeholder="Enter amount"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={`${inputStyle} h-11`}
                  placeholder="Enter purpose of claim"
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelStyle}>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={`${inputStyle} h-20`}
                  placeholder="Enter optional remarks..."
                />
              </div>
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-[oklch(0.645_0.246_16.439)] text-white rounded-md hover:opacity-90 font-medium"
                >
                  {editId ? "Update Request" : "Submit Request"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimRequest;
