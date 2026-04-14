import React, { useState } from "react";
import SpinnerDatePicker from "../SpinnerDatePicker";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import axios from "axios";
import SearchDropdown from "../SearchDropdown";

const API_BASE = "http://localhost:3000/api";

const ShiftUpload = () => {
  const [formData, setFormData] = useState({
    frompunch: "",
    topunch: "",
  });

  const [locationOptions, setLocationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [shiftMasters, setShiftMasters] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    try {
      const [locRes, empRes, shiftRes] = await Promise.all([
        axios.get(`${API_BASE}/master/geofencing`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/employee`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/master/shifts`, { headers: getHeaders() }),
      ]);
      setLocationOptions(locRes.data || []);
      setEmployeeOptions(empRes.data || []);
      setShiftMasters(shiftRes.data || []);
    } catch (error) {
      console.error("Failed to fetch masters:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2  rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm";

  const labelStyle = "text-base font-semibold text-gray-700 mb-2 block";

  const getDatesBetween = (start, end) => {
    const dates = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split("/");
    return new Date(y, m - 1, d);
  };

  const fromDateObj = parseDate(formData.frompunch);
  const toDateObj = parseDate(formData.topunch);

  const dateRange =
    fromDateObj && toDateObj ? getDatesBetween(fromDateObj, toDateObj) : [];

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showFromSpinner, setShowFromSpinner] = useState(false);
  const [showToSpinner, setShowToSpinner] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please choose a file first");
      return;
    }

    const fileType = selectedFile.type;

    // IMAGE UPLOAD
    if (fileType.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setPreview(imageUrl);

        toast.success("Image uploaded successfully");
      };

      reader.readAsDataURL(selectedFile);
    }

    // EXCEL UPLOAD
    else if (
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls")
    ) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process jsonData for Bulk Assign
        // Expected Excel Format: columns for 'Employee ID', 'Location', and dates 'dd/mm/yyyy'
        try {
          const bulkData = jsonData.map((row) => {
            const employee_enrollment_id =
              row["Employee ID"] || row["EmployeeID"];
            const location_name = row["Location"];
            const location = locationOptions.find(
              (l) => l.name === location_name,
            );
            const roster = {};

            Object.keys(row).forEach((key) => {
              if (key.includes("/")) {
                // Assuming dates are in dd/mm/yyyy
                const shiftName = row[key];
                const shift = shiftMasters.find(
                  (s) => s.shift_name === shiftName,
                );
                if (shift) roster[key] = shift.id;
                else if (shiftName === "Off") roster[key] = "Off";
              }
            });

            return {
              employee_enrollment_id,
              location_id: location?.id,
              roster,
            };
          });

          await axios.post(
            `${API_BASE}/shift-planner/bulk-assign`,
            { rosters: bulkData },
            { headers: getHeaders() },
          );
          toast.success("Shift roster uploaded successfully");
          setPreview(null);
          setSelectedFile(null);
        } catch (error) {
          console.error("Bulk upload failed:", error);
          toast.error("Format error or server error");
        }
      };
    }

    // INVALID FILE
    else {
      toast.error("Unsupported file format");
    }
  };

  const handleDownload = () => {
    if (!fromDateObj || !toDateObj) {
      toast.error("Please select date range");
      return;
    }

    const row = {
      "Employee ID": "",
      Location: "",
    };

    dateRange.forEach((date) => {
      const key = date.toLocaleDateString("en-GB");
      row[key] = "";
    });

    const worksheet = XLSX.utils.json_to_sheet([row]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shift");

    XLSX.writeFile(workbook, "ShiftData.xlsx");

    toast.success("Download Successful");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
        <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-gray-500">Transaction</span>
          <FaAngleRight className="text-blue-500 text-base" />
          <span className="text-blue-600">Shift Upload</span>
        </h1>
      </div>

      {/* Container */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-blue-100/50 shadow-xl p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {/* From Date */}
          <div className="relative">
            <label className={labelStyle}>
              From Punch Date <span className="text-red-500">*</span>
            </label>
            <input
              name="frompunch"
              value={formData.frompunch}
              onChange={(e) =>
                setFormData({ ...formData, frompunch: e.target.value })
              }
              onClick={() => setShowFromSpinner(true)}
              placeholder="dd/mm/yyyy"
              className={inputStyle}
            />

            {showFromSpinner && (
              <SpinnerDatePicker
                value={formData.frompunch}
                onChange={(date) =>
                  setFormData({ ...formData, frompunch: date })
                }
                onClose={() => setShowFromSpinner(false)}
              />
            )}
          </div>

          {/* To Date */}
          <div className="relative">
            <label className={labelStyle}>
              To Punch Date <span className="text-red-500">*</span>
            </label>
            <input
              name="topunch"
              value={formData.topunch}
              onChange={(e) =>
                setFormData({ ...formData, topunch: e.target.value })
              }
              onClick={() => setShowToSpinner(true)}
              placeholder={
                !formData.frompunch ? "Select Start Date" : "dd/mm/yyyy"
              }
              disabled={!formData.frompunch}
              className={inputStyle}
            />

            {showToSpinner && (
              <SpinnerDatePicker
                value={formData.topunch}
                onChange={(date) => setFormData({ ...formData, topunch: date })}
                onClose={() => setShowToSpinner(false)}
              />
            )}
          </div>

          {/* Download Button */}
          <div className="flex items-end mb-1">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Download Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-t border-blue-100/30 pt-6">
          <label className={labelStyle}>File Upload</label>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              type="file"
              accept=".xlsx,.xls,image/*"
              onChange={handleFileChange}
              className=" w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
            />

            <button
              onClick={handleUpload}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:shadow-md transition-all whitespace-nowrap"
            >
              Import File
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="preview"
                className="w-40 rounded-lg border border-blue-100 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftUpload;
