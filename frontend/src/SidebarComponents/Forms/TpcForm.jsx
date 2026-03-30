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

const API_URL = "http://localhost:3000/api/form/tpcForm";
import SearchDropdown from "../SearchDropdown";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SignPad from "./SignPad";
import SpinnerTimePicker from "../SpinnerTimePicker";

const TpcForm = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);

  const labelStyle =
    "whitespace-nowrap text-[16px] text-[oklch(0.147_0.004_49.25)] my-1 block w-1/2";

  const inputStyle =
    "text-[16px] w-full border border-[oklch(0.923_0.003_48.717)] bg-white  rounded-md px-3 pt-0.5 text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

  const defaultFormData = {
    employee_name: "",
    location: "",
    enrollment_id: "",
    mobile: "",
    date: "",
    comments: "",
    through_person: "",
    signature: "",
    signature_drawn: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setRequestData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
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
    const header = ["Employee Name", "Location", "EnrollmentID"].join("\t");

    const rows = requestData
      .map((item) => {
        return [item.employee_name, item.location, item.enrollment_id].join(
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
      EmployeeName: item.employee_name,
      EnrollmentID: item.enrollment_id,
      Location: item.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "TpcFormData");

    XLSX.writeFile(workbook, "TpcFormData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["Employee Name", "EnrollmentID", "Location"];

    const tableRows = [];

    requestData.forEach((item) => {
      const row = [item.employee_name, item.enrollment_id, item.location];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("TpcFormData.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            TPC Form
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => (
                setMode(""),
                setEditId(null),
                setFormData(defaultFormData),
                setOpenModal(true)
              )}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
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
                    Location
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Enrollment Id
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

                      <td className="p-2">{item.employee_name}</td>

                      <td className="p-2 hidden md:table-cell">
                        {item.location}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.enrollment_id}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-4">
                    <div className="border border-gray-400 rounded p-2 sm:p-4 ">
                      To
                      <p className="ml-2 sm:ml-6">Sefecor Security Person</p>
                    </div>
                    <div className="col-span-2 border border-gray-400 rounded p-2 sm:p-4">
                      From
                      <div className="ml-2 sm:ml-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                          <div className="flex flex-row gap-2">
                            <label className={labelStyle}> Name</label>
                            <div className={inputStyle}>
                              <SearchDropdown
                                name="employee_name"
                                value={formData.employee_name}
                                options={["Employee 1", "Employee 2"]}
                                formData={formData}
                                setFormData={setFormData}
                                disabled={mode === "view"}
                                className={inputStyle}
                              />
                            </div>
                          </div>

                          <div className="flex flex-row gap-2">
                            <label className={labelStyle}>ID</label>

                            <input
                              name="enrollment_id"
                              value={formData.enrollment_id}
                              onChange={handleChange}
                              className={inputStyle}
                              disabled={mode === "view"}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                          <div className="flex flex-row gap-2">
                            <label className={labelStyle}>Location</label>
                            <div className={inputStyle}>
                              <SearchDropdown
                                name="location"
                                value={formData.location}
                                options={[
                                  "Head Office",
                                  "location 1",
                                  "location 2",
                                ]}
                                formData={formData}
                                setFormData={setFormData}
                                disabled={mode === "view"}
                                className={inputStyle}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                          <div className="flex flex-row gap-2">
                            <label className={labelStyle}>Mobile No.</label>
                            <input
                              type="number"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              className={inputStyle}
                              disabled={mode === "view"}
                            />
                          </div>

                          <div className="flex flex-row gap-2 ">
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
                      </div>
                    </div>
                  </div>

                  <div className="sm:flex sm:flex-row gap-2 mt-3 gap-2">
                    <label className="whitespace-nowrap text-md text-[oklch(0.147_0.004_49.25)] my-1 w-1/5">
                      {" "}
                      Through:
                    </label>
                    <div className={inputStyle}>
                      <SearchDropdown
                        name="through_person"
                        value={formData.through_person}
                        options={["Employee 1", "Employee 2"]}
                        formData={formData}
                        setFormData={setFormData}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="sm:flex sm:flex-row gap-2 mt-3 gap-2">
                    <label className="whitespace-nowrap text-md text-[oklch(0.147_0.004_49.25)] my-1 w-1/5">
                      {" "}
                      Comments:
                    </label>
                    <textarea
                      name="comments"
                      onChange={handleChange}
                      value={formData.comments}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>

                  <div className="sm:flex sm:flex-row gap-2 mt-3 gap-2">
                    <label className="whitespace-nowrap text-md text-[oklch(0.147_0.004_49.25)] my-1 w-1/6">
                      Signature
                    </label>
                    <div className="flex flex-col">
                      <input
                        type="file"
                        name="signature"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            signature: e.target.files[0],
                          }))
                        }
                        className="border border-gray-400 p-1 w-[200px]"
                        disabled={mode === "view"}
                      />
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

export default TpcForm;
