import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";

const ShiftUpload = () => {
  const [formData, setFormData] = useState({
    frompunch: null,
    topunch: null,
    location: "",
    employee: "",
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const getDatesBetween = (start, end) => {
    const dates = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const dateRange =
    formData.frompunch && formData.topunch
      ? getDatesBetween(formData.frompunch, formData.topunch)
      : [];

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

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

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Excel Data:", jsonData);

        toast.success("Excel uploaded successfully");
      };
    }

    // INVALID FILE
    else {
      toast.error("Unsupported file format");
    }
  };

  const handleDownload = () => {
    if (!formData.frompunch || !formData.topunch) {
      toast.error("Please select date range");
      return;
    }

    const row = {
      Location: formData.location,
      Employee: formData.employee,
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
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 pt-1.5 text-lg font-semibold flex-wrap mb-6">
          <FaAngleRight />
          Transaction
          <FaAngleRight />
          Shift Upload
        </h1>
      </div>

      <div className="bg-[oklch(1_0_0)] p-6 rounded-xl shadow-sm border border-[oklch(0.923_0.003_48.717)]">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className={labelStyle}>
              From Punch Date
              <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
            </label>
            <DatePicker
              placeholderText="dd/mm/yyyy"
              selected={formData.frompunch}
              onChange={(date) => setFormData({ ...formData, frompunch: date })}
              className={inputStyle}
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              scrollableYearDropdown
              minDate={new Date(1950, 0, 1)}
              maxDate={new Date(new Date().getFullYear() + 15, 11, 31)}
            />
          </div>

          <div>
            <label className={labelStyle}>
              To Punch Date
              <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
            </label>

            <DatePicker
              placeholderText={
                !formData.frompunch ? "Select Start Date" : "dd/mm/yyyy"
              }
              selected={formData.topunch}
              onChange={(date) => setFormData({ ...formData, topunch: date })}
              className={inputStyle}
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              scrollableYearDropdown
              minDate={formData.frompunch}
              maxDate={new Date(new Date().getFullYear() + 15, 11, 31)}
              disabled={!formData.frompunch}
            />
          </div>

          <div>
            {" "}
            <button
              className="px-6 py-2 mt-4 rounded-lg text-white bg-[oklch(0.645_0.246_16.439)]"
              onClick={handleDownload}
            >
              Download
            </button>
          </div>
        </div>

        <div>
          <label className={labelStyle}>File Upload</label>
          <input
            type="file"
            accept=".xlsx,.xls,image/*"
            onChange={handleFileChange}
            className="text-sm"
          />

          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-[oklch(0.57_0.001_106.424)] text-white rounded"
          >
            Import
          </button>
        </div>

        {preview && (
          <img src={preview} alt="preview" className="w-40 mt-4 rounded-md" />
        )}
      </div>
    </div>
  );
};

export default ShiftUpload;
