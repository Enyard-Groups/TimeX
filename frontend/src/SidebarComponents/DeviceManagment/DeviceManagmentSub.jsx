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
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [formData, setFormData] = useState({
    devicemodel: "",
    name: "",
    company: "",
    company_name: "",
    deviceip: "",
    deviceserialno: "",
    latitude: "",
    longitude: "",
    isFace: false,
    isFingerprint: false,
    isCardNo: false,
    isPinNo: false,
    isActive: false,
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

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/device/devices`, {
        headers: getHeaders(),
      });
      const payload = response?.data?.data ?? response?.data;
      console.log(payload);
      // Map snake_case booleans back to camelCase for display
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
        company: d.company ?? "",
        company_name: d.company_name ?? "",
        devicemodel: d.device_model ?? "",
      }));
      setDevicemanagement(mapped);
    } catch (error) {
      console.error("Failed to fetch devices", error);
      toast.error("Failed to load data");
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
      (device.company_name || device.company || "").toLowerCase().startsWith(searchTerm.toLowerCase()),
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
    const { name, company, deviceip } = formData;

    if (!name || !company || !deviceip) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_BASE}/device/devices/${editId}`, formData, {
          headers: getHeaders(),
        });
        toast.success("Data updated");
      } else {
        await axios.post(`${API_BASE}/device/devices`, formData, {
          headers: getHeaders(),
        });
        toast.success("Data Added");
      }
      await fetchDevices();
      setOpenModal(false);
      setEditId(null);
      setFormData({
        company: "",
        company_name: "",
        name: "",
        deviceip: "",
        deviceserialno: "",
        longitude: "",
        latitude: "",
        devicemodel: "",
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
    <div className="mb-6">
      {/* Header */}
      <div className="sm:flex sm:justify-between">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold flex-wrap ml-10 lg:ml-0 mb-4 lg:mb-0">
          <FaAngleRight />
          Device Management
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
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
                  company_name: "",
                  name: "",
                  deviceip: "",
                  deviceserialno: "",
                  longitude: "",
                  latitude: "",
                  devicemodel: "",
                  isFace: false,
                  isFingerprint: false,
                  isCardNo: false,
                  isPinNo: false,
                  isActive: false,
                });
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
          className="overflow-x-auto min-h-[300px]"
          style={{ scrollbarWidth: "none" }}
        >
          <table className="w-full text-lg border-collapse">
            <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
              <tr>
                <th className="py-2 px-6 font-semibold hidden sm:table-cell">
                  SL.NO
                </th>
                <th className="py-2 px-6 font-semibold hidden md:table-cell">
                  Device Serial No
                </th>
                <th className="py-2 px-6 font-semibold">Name</th>
                <th className="py-2 px-6 font-semibold hidden md:table-cell">
                  Device IP
                </th>
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">
                  Face
                </th>
                <th className="py-2 px-6 font-semibold hidden lg:table-cell">
                  FingerPrint
                </th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">
                  Card No
                </th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">
                  Pin No
                </th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">
                  Company
                </th>
                <th className="py-2 px-6 font-semibold hidden xl:table-cell">
                  Active
                </th>
                <th className="py-2 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentdevicemanagement.length === 0 ? (
                <tr>
                  <td colSpan="11" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentdevicemanagement.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6 hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="py-2 px-6 hidden md:table-cell">
                      {item.deviceserialno}
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">{item.name}</td>
                    <td className="py-2 px-6 hidden md:table-cell">
                      {item.deviceip}
                    </td>
                    <td className="py-2 px-6 hidden lg:table-cell">
                      {item.isFace ? "Y" : "N"}
                    </td>
                    <td className="py-2 px-6 hidden lg:table-cell">
                      {item.isFingerprint ? "Y" : "N"}
                    </td>
                    <td className="py-2 px-6 hidden xl:table-cell">
                      {item.isCardNo ? "Y" : "N"}
                    </td>
                    <td className="py-2 px-6 hidden xl:table-cell">
                      {item.isPinNo ? "Y" : "N"}
                    </td>
                    <td className="py-2 px-6 hidden xl:table-cell">
                      {item.company_name || item.company}
                    </td>
                    <td className="py-2 px-6 hidden xl:table-cell">
                      {item.isActive ? "Y" : "N"}
                    </td>
                    <td className="py-2 px-6">
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
            Showing{" "}
            {filteredDevicemanagement.length === 0 ? "0" : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredDevicemanagement.length)} of{" "}
            {filteredDevicemanagement.length} entries
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
                  Device Serial Number{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="deviceserialno"
                  value={formData.deviceserialno}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Serial"
                  className={inputStyle}
                />
              </div>
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
                <SearchDropdown
                  label="Device Model"
                  name="devicemodel"
                  value={formData.devicemodel}
                  options={["Model 1", "Model 2", "Model 3"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>
                  Device IP{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="deviceip"
                  value={formData.deviceip}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Device IP"
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
                <label className={labelStyle}>Longitude Address</label>
                <input
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="0"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Latitude Address</label>
                <input
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="0"
                  className={inputStyle}
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
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Face</label>
                <input
                  type="checkbox"
                  name="isFace"
                  checked={formData.isFace}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>FingerPrint</label>
                <input
                  type="checkbox"
                  name="isFingerprint"
                  checked={formData.isFingerprint}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Card No</label>
                <input
                  type="checkbox"
                  name="isCardNo"
                  checked={formData.isCardNo}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <label className={labelStyle}>Pin No</label>
                <input
                  type="checkbox"
                  name="isPinNo"
                  checked={formData.isPinNo}
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

export default DeviceManagementSub;
