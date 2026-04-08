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

const LocationGroup = () => {
  const API_BASE = "http://localhost:3000/api";

  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [locationGroup, setLocationGroup] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    group_name: "",
    company: "",
    description: "",
    site_manager: "",
    time_keeper: "",
  });

  const filteredlocationGroup = locationGroup.filter((locationgroup) => {
    const search = searchTerm.toLowerCase();
    const nameMatch = (locationgroup.group_name ?? "")
      .toLowerCase()
      .startsWith(search);
    const companyMatch = (locationgroup.company ?? "")
      .toLowerCase()
      .startsWith(search);

    return nameMatch || companyMatch;
  });

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentlocationGroup = filteredlocationGroup.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredlocationGroup.length / entriesPerPage),
  );

  const getLocationGroupId = (item) => item?.id ?? item?._id;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchLocationGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await axios.get(`${API_BASE}/master/location-groups`, {
        headers,
      });

      // API shape varies across projects: handle both `{ data: [...] }` and `[...]`.
      const payload = response?.data?.data ?? response?.data;
      setLocationGroup(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch location groups", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This is an intentional "load on mount" pattern.
    fetchLocationGroups();
  }, []);

  const handleSubmit = async () => {
    const { group_name, company, description, site_manager, time_keeper } =
      formData;

    if (
      !group_name ||
      !company ||
      !description ||
      !site_manager ||
      !time_keeper
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        group_name,
        description,
        time_keeper,
        site_manager,
        company,
      };

      if (editId) {
        console.log("Saving location group (PUT)", { editId, payload });
        await axios.put(
          `${API_BASE}/master/location-groups/${editId}`,
          payload,
          { headers },
        );
        toast.success("Data updated");
      } else {
        console.log("Saving location group (POST)", { payload });
        await axios.post(`${API_BASE}/master/location-groups`, payload, {
          headers,
        });
        toast.success("Data Added");
      }

      await fetchLocationGroups();
      setOpenModal(false);
      setEditId(null);
      setFormData({
        group_name: "",
        company: "",
        description: "",
        site_manager: "",
        time_keeper: "",
      });
    } catch (error) {
      console.error("Failed to save location group", error);
      const message =
        error?.response?.data?.message ??
        error?.response?.data ??
        error?.message ??
        "Failed to save data";
      toast.error(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await axios.delete(`${API_BASE}/master/location-groups/${id}`, {
        headers,
      });
      toast.success("Deleted Successfully");
      fetchLocationGroups();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data");
    }
  };
  const handleCopy = () => {
    const header =
      "SL.NO\tLocation Group Name\tDescription\tTime Keeper Name\tSite Manager Name\tCompany";

    const rows = filteredlocationGroup
      .map(
        (d, i) =>
          `${i + 1}\t${d.group_name}\t${d.description}\t${d.time_keeper}\t${d.site_manager}\t${d.company}`,
      )
      .join("\n");

    const text = header + "\n" + rows;

    navigator.clipboard.writeText(text);

    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredlocationGroup.map((d, i) => ({
      "SL.NO": i + 1,
      "Location Group Name": d.group_name,
      Description: d.description,
      "Time Keeper Name": d.time_keeper,
      "Site Manager Name": d.site_manager,
      Company: d.company,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Location Group");

    XLSX.writeFile(workbook, "LocationGroup.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Location Group Name",
      "Location Group Description",
      "Time Keeper Name",
      "Site Manager Name",
      "Company",
    ];

    const tableRows = filteredlocationGroup.map((d, i) => [
      i + 1,
      d.group_name,
      d.description,
      d.time_keeper,
      d.site_manager,
      d.company,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("LocationGroup.pdf");
  };

  return (
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-base lg:text-xl 3xl:text-4xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Device Management</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
          >
            Location Group
          </div>
        </h1>

        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData({
                  group_name: "",
                  company: "",
                  description: "",
                  site_manager: "",
                  time_keeper: "",
                });
                setOpenModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg lg:text-lg 3xl:text-xl border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
        {/* Top Controls */}
        <div className="p-6 border-b border-blue-100/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
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
              <span className="text-sm lg:text-base 3xl:text-lg font-medium text-gray-600">
                entries
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search location group..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 lg:text-base 3xl:text-lg rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <GoCopy className="text-lg lg:text-xl 3xl:text-3xl" />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                  title="Export to Excel"
                >
                  <FaFileExcel className="text-lg lg:text-xl 3xl:text-3xl" />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                  title="Export to PDF"
                >
                  <FaFilePdf className="text-lg lg:text-xl 3xl:text-3xl" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-[16px] lg:text-[19px] 3xl:text-[22px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  SL.NO
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Location Group Name
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Time Keeper Name
                </th>
                <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                  Site Manager Name
                </th>
                <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Company
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
                    colSpan="7"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentlocationGroup.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">🌐</div>
                      <p className="text-gray-500 text-base font-medium">
                        No location group
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentlocationGroup.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center hidden sm:table-cell text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-2 text-center font-medium text-gray-900">
                      {item.group_name || "-"}
                    </td>
                    <td className="px-6 py-2 text-center hidden lg:table-cell text-gray-600">
                      {item.description || "-"}
                    </td>
                    <td className="px-6 py-2 text-center hidden md:table-cell text-gray-600">
                      {item.time_keeper || "-"}
                    </td>
                    <td className="px-6 py-2 text-center hidden lg:table-cell text-gray-600">
                      {item.site_manager || "-"}
                    </td>
                    <td className="px-6 py-2 text-center hidden xl:table-cell text-gray-600">
                      {item.company || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setFormData({ ...item });
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                          title="View"
                        >
                          <FaEye className="text-lg lg:text-xl 3xl:text-4xl" />
                        </button>
                        <button
                          onClick={() => {
                            setFormData({ ...item });
                            setEditId(item.id);
                            setMode("edit");
                            setOpenModal(true);
                          }}
                          className="text-green-500 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FaPen className="text-lg lg:text-xl 3xl:text-4xl" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                          title="Delete"
                        >
                          <MdDeleteForever className="text-xl lg:text-xl 3xl:text-4xl" />
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
          <span className="text-sm lg:text-base 3xl:text-lg text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-bold">
              {filteredlocationGroup.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-bold">
              {Math.min(endIndex, filteredlocationGroup.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-bold">
              {filteredlocationGroup.length}
            </span>{" "}
            entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium transition-all"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrPrevious />
            </button>
            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm lg:text-base 3xl:text-xl min-w-[45px] text-center">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
            >
              <GrNext />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm lg:text-base 3xl:text-xl font-medium transition-all"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                {mode === "view"
                  ? "View Location Group"
                  : mode === "edit"
                    ? "Edit Location Group"
                    : "Add New Location Group"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter company"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 disabled:bg-gray-100 transition-all shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                  Location Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter group name"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 disabled:bg-gray-100 transition-all shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm lg:text-lg 3xl:text-xl font-semibold text-gray-700 mb-2 block">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter description"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 disabled:bg-gray-100 transition-all shadow-sm"
                  required
                />
              </div>
              <SearchDropdown
                label="Site Manager Name"
                name="site_manager"
                value={formData.site_manager}
                options={["Name 1", "Name 2"]}
                formData={formData}
                setFormData={setFormData}
                disabled={mode === "view"}
                inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm font-medium"
                labelStyle="text-sm lg:text-lg 3xl:text-xl font-bold text-gray-700 mb-2 block"
              />
              <SearchDropdown
                label="Time Keeper Name"
                name="time_keeper"
                value={formData.time_keeper}
                options={["Name 1", "Name 2"]}
                formData={formData}
                setFormData={setFormData}
                disabled={mode === "view"}
                inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm font-medium"
                labelStyle="text-sm lg:text-lg 3xl:text-xl font-bold text-gray-700 mb-2 block"
              />
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-3 pt-4 border-t border-blue-100/30">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 lg:text-lg 3xl:text-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg lg:text-lg 3xl:text-xl transition-all duration-200"
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

export default LocationGroup;
