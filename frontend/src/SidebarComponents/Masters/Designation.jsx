import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { FaEye, FaPen } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import SearchDropdown from "../SearchDropdown";
import { MdDeleteForever } from "react-icons/md";

const Designation = () => {
  const API_BASE = "http://localhost:3000/api";

  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [designation, setDesignation] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    company_name: "",
    code: "",
    department: "",
    description: "",
    isActive: false,
  });


  const fetchDesignations = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await axios.get(`${API_BASE}/master/designation`, {
        headers,
      });

      const data = Array.isArray(res.data) ? res.data : [];

      setDesignation(
        data.map((d) => ({
          id: d.id,
          name: d.name || "",
          code: d.code || "",
          company: d.company || "",
          company_name: d.company_name || "",
          department: d.department || "",
          description: d.description || "",
          isActive:
            d.is_active === true ||
            d.is_active === "true" ||
            d.is_active === 1 ||
            d.isActive === true,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch designations", error);
      toast.error("Unable to load designations");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/companies`);
      setCompanyOptions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchCompanies();
  }, []);


  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filtereddesignation = designation.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (x.company_name || "").toLowerCase().startsWith(searchTerm.toLowerCase()),

  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentdesignation = filtereddesignation.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filtereddesignation.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, company, code, department, description, isActive } = formData;

    if (!name || !company || !code || !department) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const payload = {
      name,
      code,
      company,
      department,
      description,
      is_active: isActive,
    };

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/master/designation/${editId}`,
          payload,
          { headers },
        );

        const updated = {
          id: res.data.id,
          name: res.data.name || "",
          code: res.data.code || "",
          company: res.data.company || "",
          company_name: res.data.company_name || "",
          department: res.data.department || "",
          description: res.data.description || "",
          isActive:
            res.data.is_active === true ||
            res.data.is_active === "true" ||
            res.data.is_active === 1 ||
            res.data.isActive === true,
        };

        setDesignation((prev) =>
          prev.map((emp) => (emp.id === editId ? updated : emp)),
        );

        toast.success("Data updated");
      } else {
        const res = await axios.post(
          `${API_BASE}/master/designation`,
          payload,
          {
            headers,
          },
        );

        const created = {
          id: res.data.id,
          name: res.data.name || "",
          code: res.data.code || "",
          company: res.data.company || "",
          company_name: res.data.company_name || "",
          department: res.data.department || "",
          description: res.data.description || "",
          isActive:
            res.data.is_active === true ||
            res.data.is_active === "true" ||
            res.data.is_active === 1 ||
            res.data.isActive === true,
        };

        setDesignation((prev) => [created, ...prev]);

        toast.success("Data Added");
      }

      setOpenModal(false);
      setEditId(null);

      setFormData({
        company: "",
        company_name: "",
        name: "",
        code: "",
        department: "",
        description: "",
        isActive: false,
      });
    } catch (error) {
      console.error("Failed to save designation", error);
      toast.error(
        error.response?.data?.message || "Unable to save designation",
      );
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      await axios.delete(`${API_BASE}/master/designation/${id}`, { headers });
      setDesignation((prev) => prev.filter((v) => v.id !== id));
      toast.success("Designation deleted");
    } catch (error) {
      console.error("Failed to delete designation", error);
      toast.error(
        error.response?.data?.message || "Unable to delete designation",
      );
    }
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Designation Name",
      "Designation Code",
      "Company",
      "Department Name",
      "Active",
    ].join("\t");

    const rows = filtereddesignation
      .map((item, index) =>
        [
          index + 1,
          item.name,
          item.code,
          item.company_name || item.company,
          item.department,
          item.isActive ? "Y" : "N",
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filtereddesignation.map((item, index) => ({
      "SL.NO": index + 1,
      "Designation Name": item.name,
      "Designation Code": item.code,
      Company: item.company_name || item.company,
      "Department Name": item.department,
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Designation");

    XLSX.writeFile(workbook, "DesignationData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Designation Name",
      "Designation Code",
      "Company",
      "Department Name",
      "Active",
    ];

    const tableRows = [];

    filtereddesignation.forEach((item, index) => {
      const row = [
        index + 1,
        item.name,
        item.code,
        item.company_name || item.company,
        item.department,
        item.isActive ? "Y" : "N",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("DesignationData.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="sm:flex sm:justify-between">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
            <FaAngleRight />
            Masters
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Designation
            </div>
          </h1>
          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => (
                  setMode(""),
                  setEditId(null),
                  setFormData({
                    company: "",
                    company_name: "",
                    name: "",
                    code: "",
                    department: "",
                    description: "",
                    isActive: false,
                  }),
                  setOpenModal(true)
                )}
                className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md whitespace-nowrap"
              >
                + Add New
              </button>
            </div>
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

                  <th className="p-2 font-semibold ">Designation Name</th>

                  <th className="p-2 font-semibold  hidden md:table-cell">
                    Designation Code
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Company
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Department Name
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Active
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentdesignation.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="sm:text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentdesignation.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2 hidden sm:table-cell">{index + 1}</td>

                      <td className="p-2">{item.name}</td>

                      <td className="p-2 hidden md:table-cell">{item.code}</td>

                      <td className="p-2 hidden lg:table-cell">
                        {item.company_name || item.company}
                      </td>

                      <td className="p-2 hidden md:table-cell">
                        {item.department}
                      </td>

                      <td className="p-2 hidden lg:table-cell">
                        {item.isActive ? "Y" : "N"}
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
              Showing {filtereddesignation.length === 0 ? "0" : startIndex + 1}{" "}
              to {Math.min(endIndex, filtereddesignation.length)} of{" "}
              {filtereddesignation.length} entries
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelStyle}>
                    Name
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Name"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Code
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Code"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <SearchDropdown
                    label={
                      <>
                        Company <span className="text-red-500">*</span>
                      </>
                    }
                    name="company"
                    value={formData.company}
                    displayValue={formData.company_name}
                    options={companyOptions}
                    labelKey="name"
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
                        Department <span className="text-red-500">*</span>
                      </>
                    }
                    name="department"
                    value={formData.department}
                    options={[
                      "Treasury And Markets",
                      "IT",
                      "Human Resources",
                      "Banking Division",
                      "Commercial / SME Banking",
                    ]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Description</label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Description"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <label className={labelStyle}>Active</label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
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
    </>
  );
};

export default Designation;
