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
import SearchDropdown from "../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const DeviceManagementSub = () => {
  const [devicemanagement, setDevicemanagement] = useState([]);
  const [deviceModels, setDeviceModels] = useState([]);
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    company_id: "",
    company_name: "",
    deviceip: "",
    deviceserialno: "",
    devicemodel: "",
    devicemodel_id: "",
    longitude: "",
    latitude: "",
    isFace: false,
    isFingerprint: false,
    isCardNo: false,
    isPinNo: false,
    isActive: false,
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/device/devices`, {
        headers: getHeaders(),
      });
      const payload = response?.data?.data ?? response?.data;
      console.log(payload);
      const mapped = (Array.isArray(payload) ? payload : []).map((d) => ({
        ...d,
        isFace: d.is_face ?? false,
        isFingerprint: d.is_fingerprint ?? false,
        isCardNo: d.is_card_no ?? false,
        isPinNo: d.is_pin_no ?? false,
        isActive: d.is_active ?? false,
        name: d.device_name ?? "",
        deviceserialno: d.serial_number ?? "",
        deviceip: d.ip_address ?? "",
        company_id: d.company ?? "",
        company_name: d.company_name ?? d.company ?? "",
        devicemodel: d.devicemodel_name ?? d.device_model ?? "",
        devicemodel_id: d.device_model ?? "",
      }));
      setDevicemanagement(mapped);
    } catch (error) {
      console.error("Failed to fetch devices", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceModels = async () => {
    try {
      const response = await axios.get(`${API_BASE}/device/device-models`, {
        headers: getHeaders(),
      });
      const payload = response?.data?.data ?? response?.data;
      setDeviceModels(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch device models", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/companies`, {
        headers: getHeaders(),
      });
      setCompanyOptions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchDeviceModels();
    fetchCompanies();
  }, []);

  const filteredDevicemanagement = devicemanagement.filter(
    (device) =>
      (device.deviceserialno ?? "")
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      (device.name ?? "").toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      (device.deviceip ?? "")
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      (device.company_name ?? device.company ?? "")
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;
  const startIndex = endIndex - entriesPerPage;
  const currentdevicemanagement = filteredDevicemanagement.slice(
    startIndex,
    endIndex,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDevicemanagement.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { name, company_id, deviceip, deviceserialno } = formData;

    if (!name || !company_id || !deviceip || !deviceserialno) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      ...formData,
      company: formData.company_id,
      device_name: formData.name,
      serial_number: formData.deviceserialno,
      ip_address: formData.deviceip,
      device_model: formData.devicemodel_id,
      is_face: formData.isFace,
      is_fingerprint: formData.isFingerprint,
      is_card_no: formData.isCardNo,
      is_pin_no: formData.isPinNo,
      is_active: formData.isActive,
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE}/device/devices/${editId}`, payload, {
          headers: getHeaders(),
        });
        toast.success("Data updated");
      } else {
        await axios.post(`${API_BASE}/device/devices`, payload, {
          headers: getHeaders(),
        });
        toast.success("Data Added");
      }
      await fetchDevices();
      setOpenModal(false);
      setEditId(null);
      setFormData({
        company: "",
        company_id: "",
        company_name: "",
        name: "",
        deviceip: "",
        deviceserialno: "",
        longitude: "",
        latitude: "",
        devicemodel: "",
        devicemodel_id: "",
        isFace: false,
        isFingerprint: false,
        isCardNo: false,
        isPinNo: false,
        isActive: false,
      });
    } catch (error) {
      console.error("Failed to save device", error);
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
      await axios.delete(`${API_BASE}/device/devices/${id}`, {
        headers: getHeaders(),
      });
      toast.success("Device deleted");
      await fetchDevices();
    } catch (error) {
      console.error("Failed to delete device", error);
      toast.error("Failed to delete device");
    }
  };

  const handleCopy = () => {
    const header =
      "SL.NO\tDevice Serial No\tName\tDevice IP\tFace\tFingerPrint\tCard No\tPin No\tCompany\tActive";
    const rows = filteredDevicemanagement
      .map(
        (d, i) =>
          `${i + 1}\t${d.deviceserialno}\t${d.name}\t${d.deviceip}\t${d.isFace ? "Y" : "N"}\t${d.isFingerprint ? "Y" : "N"}\t${d.isCardNo ? "Y" : "N"}\t${d.isPinNo ? "Y" : "N"}\t${d.company_name || d.company}\t${d.isActive ? "Y" : "N"}`,
      )
      .join("\n");
    navigator.clipboard.writeText(header + "\n" + rows);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredDevicemanagement.map((d, i) => ({
      "SL.NO": i + 1,
      "Device Serial No": d.deviceserialno,
      Name: d.name,
      "Device IP": d.deviceip,
      Face: d.isFace ? "Y" : "N",
      FingerPrint: d.isFingerprint ? "Y" : "N",
      "Card No": d.isCardNo ? "Y" : "N",
      "Pin No": d.isPinNo ? "Y" : "N",
      Company: d.company_name || d.company,
      Active: d.isActive ? "Y" : "N",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Devices");
    XLSX.writeFile(workbook, "DeviceManagement.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "SL.NO",
      "Device Serial No",
      "Name",
      "Device IP",
      "Face",
      "FingerPrint",
      "Card No",
      "Pin No",
      "Company",
      "Active",
    ];
    const tableRows = filteredDevicemanagement.map((d, i) => [
      i + 1,
      d.deviceserialno,
      d.name,
      d.deviceip,
      d.isFace ? "Y" : "N",
      d.isFingerprint ? "Y" : "N",
      d.isCardNo ? "Y" : "N",
      d.isPinNo ? "Y" : "N",
      d.company_name || d.company,
      d.isActive ? "Y" : "N",
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("DeviceManagement.pdf");
  };

  return (
    <div className="mb-6 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Device Management</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <div
            onClick={() => setOpenModal(false)}
            className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
          >
            Device Management
          </div>
        </h1>

        {!openModal && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMode("");
                setEditId(null);
                setFormData({
                  company: "",
                  company_id: "",
                  company_name: "",
                  name: "",
                  deviceip: "",
                  deviceserialno: "",
                  longitude: "",
                  latitude: "",
                  devicemodel: "",
                  devicemodel_id: "",
                  isFace: false,
                  isFingerprint: false,
                  isCardNo: false,
                  isPinNo: false,
                  isActive: false,
                });
                setOpenModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
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
              <label className="text-sm xl:text-base font-medium text-gray-600">
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
              <span className="text-sm xl:text-base font-medium text-gray-600">
                entries
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center">
              <input
                placeholder="Search device..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                  title="Copy to clipboard"
                >
                  <GoCopy className="text-lg  xl:text-xl" />
                </button>
                <button
                  onClick={handleExcel}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                  title="Export to Excel"
                >
                  <FaFileExcel className="text-lg  xl:text-xl" />
                </button>
                <button
                  onClick={handlePDF}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                  title="Export to PDF"
                >
                  <FaFilePdf className="text-lg xl:text-xl" />
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
          <table className="w-full text-[17px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                  SL.NO
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Serial No
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                  Device IP
                </th>
                <th className="px-6 py-3 text-center hidden xl:table-cell font-semibold text-gray-700">
                  Features
                </th>
                <th className="px-6 py-3 text-center hidden 2xl:table-cell font-semibold text-gray-700">
                  Company
                </th>
                <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
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
                    colSpan="8"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentdevicemanagement.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl opacity-40">🛠️</div>
                      <p className="text-gray-500 text-base font-medium">
                        No Device data
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentdevicemanagement.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                  >
                    <td className="px-6 py-2 text-center hidden sm:table-cell text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-2 text-center hidden md:table-cell text-gray-600">
                      {item.deviceserialno || "-"}
                    </td>
                    <td className="px-6 py-2 text-center font-medium text-gray-900">
                      {item.name || "-"}
                    </td>
                    <td className="px-6 py-2 text-center hidden md:table-cell text-gray-600">
                      {item.deviceip || "-"}
                    </td>
                    <td className="px-6 py-2 text-center hidden xl:table-cell">
                      <div className="flex justify-center gap-1">
                        {item.isFace && (
                          <span
                            title="Face"
                            className="text-blue-500 text-xs lg:text-sm bg-blue-50 px-1.5 py-0.5 rounded"
                          >
                            F
                          </span>
                        )}
                        {item.isFingerprint && (
                          <span
                            title="Fingerprint"
                            className="text-teal-500 text-xs lg:text-sm bg-teal-50 px-1.5 py-0.5 rounded"
                          >
                            FP
                          </span>
                        )}
                        {item.isCardNo && (
                          <span
                            title="Card"
                            className="text-purple-500 text-xs lg:text-sm bg-purple-50 px-1.5 py-0.5 rounded"
                          >
                            C
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2 text-center hidden 2xl:table-cell text-gray-600">
                      {item.company_name || item.company || "-"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-center">
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm lg:text-base 3xl:text-lg font-semibold border ${item.isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                        >
                          {item.isActive ? "✓ Active" : "○ Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setFormData(item);
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
                            setFormData(item);
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

        {/* Pagination Section */}
        <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-sm xl:text-base text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {filteredDevicemanagement.length === 0 ? "0" : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {Math.min(endIndex, filteredDevicemanagement.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {filteredDevicemanagement.length}
            </span>{" "}
            entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage == 1}
              onClick={() => setCurrentPage(1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              title="First page"
            >
              First
            </button>

            <button
              disabled={currentPage == 1}
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
              disabled={currentPage == totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
              title="Next page"
            >
              <GrNext />
            </button>

            <button
              disabled={currentPage == totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              title="Last page"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
              <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900">
                {mode === "view"
                  ? "View Device"
                  : mode === "edit"
                    ? "Edit Device"
                    : "Add New Device"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div key="deviceserialno">
                <label className={labelStyle}>
                  Device Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="deviceserialno"
                  value={formData.deviceserialno}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter serial number"
                  className={inputStyle}
                />
              </div>
              <div key="name">
                <label className={labelStyle}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Enter device name"
                  className={inputStyle}
                />
              </div>
              <div key="deviceip">
                <label className={labelStyle}>
                  Device IP <span className="text-red-500">*</span>
                </label>
                <input
                  name="deviceip"
                  value={formData.deviceip}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="e.g. 192.168.1.1"
                  className={inputStyle}
                />
              </div>
              <div key="longitude">
                <label className={labelStyle}>Longitude</label>
                <input
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="0"
                  className={inputStyle}
                />
              </div>
              <div key="latitude">
                <label className={labelStyle}>Latitude</label>
                <input
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="0"
                  className={inputStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label={
                    <>
                      Company <span className="text-red-500">*</span>
                    </>
                  }
                  name="company_id"
                  value={formData.company_id}
                  displayValue={formData.company_name}
                  options={companyOptions}
                  labelKey="name"
                  valueKey="id"
                  labelName="company_name"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
              <div>
                <SearchDropdown
                  label={<>Device Model</>}
                  name="devicemodel_id"
                  value={formData.devicemodel_id}
                  displayValue={formData.devicemodel}
                  options={deviceModels}
                  labelKey="name"
                  valueKey="id"
                  labelName="devicemodel"
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {[
                { name: "isActive", label: "Active" },
                { name: "isFace", label: "Face" },
                { name: "isFingerprint", label: "Fingerprint" },
                { name: "isCardNo", label: "Card No" },
                { name: "isPinNo", label: "Pin No" },
              ].map(({ name, label }) => (
                <label
                  key={name}
                  className={`${inputStyle} flex flex-row gap-4 pt-4`}
                >
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name]}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className={labelStyle}>{label}</span>
                </label>
              ))}
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-3 pt-6 border-t border-blue-100/30">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 xl:text-base hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold xl:text-base px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
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

export default DeviceManagementSub;
