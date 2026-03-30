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

const API_BASE = "http://localhost:3000/api";

const DeviceModel = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [deviceModel, setDeviceModel] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    code: "",
    active: false,
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchDeviceModels = async () => {
    try {
      const response = await axios.get(`${API_BASE}/device/device-models`, {
        headers: getHeaders(),
      });
      const payload = response?.data?.data ?? response?.data;
      const mapped = (Array.isArray(payload) ? payload : []).map((d) => ({
        ...d,
        active: d.active ?? false,
      }));
      setDeviceModel(mapped);
    } catch (error) {
      console.error("Failed to fetch device models", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchDeviceModels();
  }, []);

  const filtereddeviceModel = deviceModel.filter(
    (device) =>
      (device.name ?? "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (device.code ?? "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (device.company ?? "").toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentdeviceModel = filtereddeviceModel.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filtereddeviceModel.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, company, code } = formData;

    if (!name || !company || !code) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editId) {
        await axios.put(
          `${API_BASE}/device/device-models/${editId}`,
          formData,
          { headers: getHeaders() },
        );
        toast.success("Data updated");
      } else {
        await axios.post(`${API_BASE}/device/device-models`, formData, {
          headers: getHeaders(),
        });
        toast.success("Data Added");
      }
      await fetchDeviceModels();
      setOpenModal(false);
      setEditId(null);
      setFormData({ company: "", name: "", code: "", active: false });
    } catch (error) {
      console.error("Failed to save device model", error);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to save data";
      toast.error(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/device/device-models/${id}`, {
        headers: getHeaders(),
      });
      toast.success("Device model deleted");
      await fetchDeviceModels();
    } catch (error) {
      console.error("Failed to delete device model", error);
      toast.error("Failed to delete device model");
    }
  };

  const handleCopy = () => {
    const header = "SL.NO\tName\tCode\tCompany\tActive";
    const rows = filtereddeviceModel
      .map(
        (d, i) =>
          `${i + 1}\t${d.name}\t${d.code}\t${d.company}\t${d.active ? "Y" : "N"}`,
      )
      .join("\n");
    navigator.clipboard.writeText(header + "\n" + rows);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const data = filtereddeviceModel.map((d, i) => ({
      "SL.NO": i + 1,
      Name: d.name,
      Code: d.code,
      Company: d.company,
      Active: d.active ? "Y" : "N",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Device Model");
    XLSX.writeFile(workbook, "DeviceModel.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = ["SL.NO", "Name", "Code", "Company", "Active"];
    const tableRows = filtereddeviceModel.map((d, i) => [
      i + 1,
      d.name,
      d.code,
      d.company,
      d.active ? "Y" : "N",
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("DeviceModel.pdf");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Device Management
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Device Model
          </div>
        </h1>
        {!openModal && (
          <div className="flex justify-end">
          <button
            onClick={() => (
              setMode(""),
              setEditId(null),
              setFormData({ company: "", name: "", code: "", active: false }),
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
                <th className="p-2 font-semibold">Name</th>
                <th className="p-2 font-semibold hidden md:table-cell">Code</th>
                <th className="p-2 font-semibold hidden lg:table-cell">
                  Company
                </th>
                <th className="p-2 font-semibold hidden lg:table-cell">
                  Active
                </th>
                <th className="p-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentdeviceModel.length === 0 ? (
                <tr>
                  <td colSpan="6" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentdeviceModel.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="p-2 hidden sm:table-cell">{index + 1}</td>
                    <td className="p-2 whitespace-nowrap">{item.name}</td>
                    <td className="p-2 hidden md:table-cell">{item.code}</td>
                    <td className="p-2 hidden lg:table-cell">{item.company}</td>
                    <td className="p-2 hidden md:table-cell">
                      {item.isActive ? "Y" : "N"}
                    </td>
                    <td className="p-2">
                      <div className="flex flex-row space-x-3 justify-center">
                        <FaEye
                          onClick={() => {
                            setFormData(item);
                            setMode("view");
                            setOpenModal(true);
                          }}
                          className="inline text-blue-500 cursor-pointer text-lg"
                        />
                        <FaPen
                          onClick={() => {
                            setFormData(item);
                            setEditId(item.id);
                            setMode("edit");
                            setOpenModal(true);
                          }}
                          className="inline text-green-500 cursor-pointer text-lg"
                        />
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
            Showing {filtereddeviceModel.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filtereddeviceModel.length)} of{" "}
            {filtereddeviceModel.length} entries
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
            <div className="flex justify-end">
              <RxCross2
                onClick={() => setOpenModal(false)}
                className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>
                  Name{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
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
                  Code{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
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
                <label className={labelStyle}>
                  Company{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Company"
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

export default DeviceModel;
