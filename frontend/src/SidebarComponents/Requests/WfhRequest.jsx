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
  start_date: "",
  end_date: "",
  number_of_days: "",
  reason: "",
  status: "Pending",
};

const WfhRequest = () => {
  const [mode, setMode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [wfh, setWfh] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fromDateSpinner, setFromDateSpinner] = useState(false);
  const [toDateSpinner, setToDateSpinner] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wfhRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/requests/wfh`),
        axios.get(`${API_BASE}/employee`),
      ]);
      setWfh(wfhRes.data);
      setEmployeeOptions(empRes.data);
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

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const from = parseDate(formData.start_date);
      const to = parseDate(formData.end_date);

      if (to && from && to >= from) {
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setFormData((prev) => ({
          ...prev,
          number_of_days: diffDays.toString(),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          number_of_days: "",
        }));
      }
    }
  }, [formData.start_date, formData.end_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { employee_id, start_date, end_date, reason } = formData;

    if (!employee_id || !start_date || !end_date || !reason) {
      toast.error("Please fill required fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(start_date);
    const to = parseDate(end_date);

    if (from < today && !editId) {
      toast.error("First Date of Absence cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Last Date must be after First Date");
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/requests/wfh/${editId}`,
          formData,
        );
        setWfh((prev) =>
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
        const res = await axios.post(`${API_BASE}/requests/wfh`, formData);
        setWfh((prev) => [
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
        await axios.delete(`${API_BASE}/requests/wfh/${id}`);
        setWfh((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Delete failed");
      }
    }
  };

  const filteredWfh = wfh.filter(
    (x) =>
      (x.employee_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (x.reason || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentWfh = filteredWfh.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWfh.length / entriesPerPage),
  );

  const handleCopy = () => {
    const header = [
      "Employee",
      "From Date",
      "To Date",
      "Reason",
      "Created Date",
    ].join("\t");
    const rows = filteredWfh
      .map((item) =>
        [
          item.employee_name,
          item.start_date,
          item.end_date,
          item.reason,
          new Date(item.created_at).toLocaleDateString(),
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;
    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredWfh.map((item) => ({
      Employee: item.employee_name,
      FromDate: item.start_date,
      ToDate: item.end_date,
      Reason: item.reason,
      CreatedDate: new Date(item.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WfhRequest");
    XLSX.writeFile(workbook, "WfhRequestData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "Employee",
      "From Date",
      "To Date",
      "Reason",
      "Created Date",
    ];
    const tableRows = filteredWfh.map((item) => [
      item.employee_name,
      item.start_date,
      item.end_date,
      item.reason,
      new Date(item.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("WfhRequestData.pdf");
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
            Wfh Request
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
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">
                  From Date
                </th>
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">
                  To Date
                </th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">
                  Days
                </th>
                <th className="py-2 px-6 font-semibold">Status</th>
                <th className="py-2 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentWfh.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentWfh.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6">{item.employee_name}</td>
                    <td className="py-2 px-6 hidden lg:table-cell">
                      {item.start_date}
                    </td>
                    <td className="py-2 px-6 hidden lg:table-cell">
                      {item.end_date}
                    </td>
                    <td className="py-2 px-6 hidden xl:table-cell">
                      {item.number_of_days}
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
            Showing {filteredWfh.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredWfh.length)} of {filteredWfh.length}{" "}
            entries
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
                  labelName="employee_name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  First Date of Absence <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="start_date"
                    value={formData.start_date}
                    onClick={() => mode !== "view" && setFromDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    readOnly
                    className={`${inputStyle} cursor-pointer`}
                  />
                  {fromDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.start_date}
                      onChange={(date) =>
                        setFormData({ ...formData, start_date: date })
                      }
                      onClose={() => setFromDateSpinner(false)}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyle}>
                  Last Date of Absence <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="end_date"
                    value={formData.end_date}
                    onClick={() => mode !== "view" && setToDateSpinner(true)}
                    disabled={mode === "view"}
                    placeholder="dd/mm/yyyy"
                    readOnly
                    className={`${inputStyle} cursor-pointer`}
                  />
                  {toDateSpinner && (
                    <SpinnerDatePicker
                      value={formData.end_date}
                      onChange={(date) =>
                        setFormData({ ...formData, end_date: date })
                      }
                      onClose={() => setToDateSpinner(false)}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyle}>Number of Days</label>
                <input
                  name="number_of_days"
                  value={formData.number_of_days}
                  readOnly
                  className="text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-gray-100 px-2 py-1 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  rows="1"
                  className={`${inputStyle} h-11`}
                  placeholder="Enter reason for WFH..."
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

export default WfhRequest;
