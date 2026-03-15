import React, { useState } from "react";
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
import SpinnerDatePicker from "../../SpinnerDatePicker";
import SearchDropdown from "../../SearchDropdown";

const HolidayMaster = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [holidayMaster, setHolidayMaster] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showHstartSpinner, setShowHstartSpinner] = useState(false);
  const [showHendSpinner, setShowHendSpinner] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    holidaystart: null,
    holidayend: null,
    company: "",
    location: "",
    isActive: false,
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredholidayMaster = holidayMaster.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.location.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentholidayMaster = filteredholidayMaster.slice(
    startIndex,
    endIndex,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredholidayMaster.length / entriesPerPage),
  );
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const { name, code, holidaystart, holidayend } = formData;

    if (!name || !code || !holidaystart || !holidayend) {
      toast.error("Please fill required fields");
      return;
    }

    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = parseDate(holidaystart);
    const to = parseDate(holidayend);

    if (from < today) {
      toast.error("First Date cannot be in the past");
      return;
    }

    if (to < from) {
      toast.error("Last Date must be after First Date");
      return;
    }

    if (editId) {
      setHolidayMaster((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setHolidayMaster((prev) => [...prev, { id: Date.now(), ...formData }]);
      toast.success("Data added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      name: "",
      code: "",
      holidaystart: null,
      holidayend: null,
      company: "",
      location: "",
      isActive: false,
    });
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Code",
      "Name",
      "Holiday Start",
      "Holiday End",
      "Company",
      "Location",
      "Active",
    ].join("\t");

    const rows = filteredholidayMaster
      .map((item, index) =>
        [
          index + 1,
          item.code,
          item.name,
          item.holidaystart,
          item.holidayend,
          item.company,
          item.location,
          item.isActive ? "Y" : "N",
        ].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredholidayMaster.map((item, index) => ({
      "SL.NO": index + 1,
      Name: item.name,
      Code: item.code,
      HolidayStart: item.holidaystart,
      HolidayEnd: item.holidayend,
      Location: item.location,
      Company: item.company,
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Holidays");

    XLSX.writeFile(workbook, "HolidayMaster.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Code",
      "Name",
      "Holiday Start",
      "Holiday End",
      "Company",
      "Location",
      "Active",
    ];

    const tableRows = [];

    filteredholidayMaster.forEach((item, index) => {
      const row = [
        index + 1,
        item.code,
        item.name,
        item.holidaystart,
        item.holidayend,
        item.company,
        item.location,
        item.isActive ? "Y" : "N",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("HolidayMaster.pdf");
  };

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Holiday Master
          </div>
        </h1>
        {!openModal && (
          <button
            onClick={() => (
              setMode(""),
              setEditId(null),
              setFormData({
                name: "",
                code: "",
                holidaystart: null,
                holidayend: null,
                company: "",
                location: "",
                isActive: false,
              }),
              setOpenModal(true)
            )}
            className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
          >
            + Add New
          </button>
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

                <th className="p-2 font-semibold hidden sm:table-cell">
                  Holiday Code
                </th>

                <th className="p-2 font-semibold">Holiday Name</th>

                <th className="p-2 font-semibold hidden md:table-cell">
                  Holiday Start
                </th>

                <th className="p-2 font-semibold hidden md:table-cell">
                  Holiday End
                </th>

                <th className="p-2 font-semibold hidden lg:table-cell">
                  Company
                </th>

                <th className="p-2 font-semibold hidden xl:table-cell">
                  Location
                </th>

                <th className="p-2 font-semibold hidden lg:table-cell">
                  Active
                </th>

                <th className="p-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentholidayMaster.length === 0 ? (
                <tr>
                  <td colSpan="12" className="sm:text-center p-10">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentholidayMaster.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="p-2 hidden sm:table-cell">{index + 1}</td>

                    <td className="p-2 hidden sm:table-cell">{item.code}</td>

                    <td className="p-2 ">{item.name}</td>

                    <td className="p-2 hidden md:table-cell">
                      {item.holidaystart ? item.holidaystart : ""}
                    </td>

                    <td className="p-2  hidden md:table-cell">
                      {item.holidayend ? item.holidayend : ""}
                    </td>

                    <td className="p-2 hidden lg:table-cell">{item.company}</td>

                    <td className="p-2 hidden xl:table-cell">
                      {item.location}
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
                          onClick={() =>
                            setHolidayMaster(
                              holidayMaster.filter((v) => v.id !== item.id),
                            )
                          }
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
            Showing {filteredholidayMaster.length === 0 ? "0" : startIndex + 1}{" "}
            to {Math.min(endIndex, filteredholidayMaster.length)} of{" "}
            {filteredholidayMaster.length} entries
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
              {/* Code */}
              <div>
                <label className={labelStyle}>
                  Holiday Code
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Holiday Code"
                  className={inputStyle}
                />
              </div>

              {/*Name */}
              <div>
                <label className={labelStyle}>
                  Holiday Name{" "}
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  placeholder="Holiday Name"
                  className={inputStyle}
                />
              </div>

              {/* Company */}
              <div>
                <SearchDropdown
                  label="Company"
                  name="company"
                  value={formData.company}
                  options={["Company 1", "Company 2", "Company 3"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Holiday Start */}
              <div>
                <label className={labelStyle}>
                  Holiday Start
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="holidaystart"
                  value={formData.holidaystart}
                  onChange={handleChange}
                  onClick={() => {
                    (setShowHstartSpinner(true), setShowHendSpinner(false));
                  }}
                  disabled={mode === "view"}
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />

                {showHstartSpinner && (
                  <SpinnerDatePicker
                    value={formData.holidaystart}
                    onChange={(date) =>
                      setFormData({ ...formData, holidaystart: date })
                    }
                    onClose={() => setShowHstartSpinner(false)}
                  />
                )}
              </div>

              {/* Holiday End */}
              <div>
                <label className={labelStyle}>
                  Holiday End
                  <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
                </label>
                <input
                  name="holidayend"
                  value={formData.holidayend}
                  onChange={handleChange}
                  onClick={() => {
                    (setShowHendSpinner(true), setShowHstartSpinner(false));
                  }}
                  disabled={mode === "view"}
                  placeholder="dd/mm/yyyy"
                  className={inputStyle}
                />

                {showHendSpinner && (
                  <SpinnerDatePicker
                    value={formData.holidayend}
                    onChange={(date) =>
                      setFormData({ ...formData, holidayend: date })
                    }
                    onClose={() => setShowHendSpinner(false)}
                  />
                )}
              </div>

              {/* Location */}
              <div>
                <SearchDropdown
                  label="Location"
                  name="location"
                  value={formData.location}
                  options={[
                    "Location1",
                    "Location2",
                    "Location3",
                    "Location4",
                    "Location5",
                    "Location6",
                  ]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2 mt-6 sm:mb-18">
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
  );
};

export default HolidayMaster;
