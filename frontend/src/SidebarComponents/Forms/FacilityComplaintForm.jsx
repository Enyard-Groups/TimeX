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

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setRequestData(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const labelStyle =
    "text-[16px] text-[oklch(0.147_0.004_49.25)] my-1 block mx-1";

  const inputStyle =
    "text-[16px] w-full border border-[oklch(0.923_0.003_48.717)] bg-white  rounded-md px-3 py-1 text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Forms
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Facility Complaint Form
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

                  <th className="p-2 font-semibold"> Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Issue Type
                  </th>

                  <th className="p-2 font-semibold hidden xl:table-cell">
                    Location
                  </th>

                  <th className="p-2 font-semibold hidden xl:table-cell">
                    Description
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Safety Concerns
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Requested Action
                  </th>

                  <th className="p-2 font-semibold hidden xl:table-cell">
                    Date Noticed
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Urgent
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
                        {item.issueType}
                      </td>

                      <td className="p-2 hidden xl:table-cell">
                        {item.location}
                      </td>
                      <td className="p-2 hidden xl:table-cell">
                        {item.description}
                      </td>

                      <td className="p-2 hidden lg:table-cell">
                        {item.safetyConcerns}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.requestedAction}
                      </td>

                      <td className="p-2 hidden xl:table-cell">{item.date}</td>

                      <td className="p-2 hidden lg:table-cell">
                        {item.urgent?"Y":"N"}
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
                  className="max-h-[75vh] max-w-[1200px] overflow-y-auto pr-2 text-sm px-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Contact No.
                      </label>
                      <input
                        type="number"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Issue Type
                      </label>
                      <SearchDropdown
                        name="issueType"
                        value={formData.issue_type}
                        options={[
                          "Electrical",
                          "Plumbing",
                          "Drainage",
                          "Cleaning",
                          "Security",
                        ]}
                        formData={formData}
                        setFormData={setFormData}
                        disabled={mode === "view"}
                        inputStyle={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Date Noticed
                      </label>
                      <input
                        type="text"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-4 gap-4">
                    <div className="col-span-2">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Description
                      </label>
                      <textarea
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Immediate Safety Concerns
                      </label>
                      <SearchDropdown
                        name="safetyConcerns"
                        value={formData.safety_concerns}
                        options={["Yes", "No"]}
                        formData={formData}
                        setFormData={setFormData}
                        disabled={mode === "view"}
                        inputStyle={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Urgent Issue
                      </label>
                      <input
                        type="checkbox"
                        name="urgent"
                        value={formData.urgent}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-4 gap-4">
                    <div className="col-span-2">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        Requested Action
                      </label>
                      <textarea
                        type="text"
                        name="requestedAction"
                        value={formData.requestedAction}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className={`whitespace-nowrap ${labelStyle}`}>
                        File Attachment
                      </label>
                      <input
                        type="file"
                        name="attachedFile"
                        value={formData.attachedFile}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
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

export default FacilityComplaintForm;
