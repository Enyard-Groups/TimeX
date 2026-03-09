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
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

const Shift = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [shift, setShift] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    code: "",
    intime: new Date().setHours(0, 0, 0, 0, 0, 0),
    outtime: new Date().setHours(0, 0, 0, 0, 0, 0),
    isActive: false,
  });

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredshift = shift.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentshift = filteredshift.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredshift.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const { name, company, code, intime, outtime, isActive } = formData;

    if (!name || !code || !intime || !outtime) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    if (new Date(outtime) <= new Date(intime)) {
      toast.error("Out Time must be after In Time");
      return;
    }

    const newshift = {
      id: Date.now(),
      name,
      code,
      company,
      intime,
      outtime,
      isActive,
    };

    if (editId) {
      setShift((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setShift((prev) => [...prev, newshift]);

      toast.success("Data Added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      company: "",
      name: "",
      code: "",
      intime: new Date().setHours(0, 0, 0, 0, 0, 0),
      outtime: new Date().setHours(0, 0, 0, 0, 0, 0),
      isActive: false,
    });
  };

  const handleCopy = () => {
    const header = [
      "SL.NO",
      "Shift Name",
      "Shift Code",
      "InTime",
      "OutTime",
      "Active",
    ].join("\t");

    const rows = filteredshift
      .map((item, index) => {
        return [
          index + 1,
          item.name,
          item.code,
          item.intime
            ? item.intime.toLocaleTimeString([], {
                hour12: false,
              })
            : "",
          item.outtime
            ? item.outtime.toLocaleTimeString([], {
                hour12: false,
              })
            : "",
          item.isActive ? "Y" : "N",
        ].join("\t");
      })
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredshift.map((item, index) => ({
      "SL.NO": index + 1,
      "Shift Name": item.name,
      "Shift Code": item.code,
      InTime: item.intime
        ? item.intime.toLocaleTimeString([], {
            hour12: false,
          })
        : "",
      OutTime: item.outtime
        ? item.outtime.toLocaleTimeString([], {
            hour12: false,
          })
        : "",
      Active: item.isActive ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Shift");

    XLSX.writeFile(workbook, "ShiftData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "Shift Name",
      "Shift Code",
      "InTime",
      "OutTime",
      "Active",
    ];

    const tableRows = [];

    filteredshift.forEach((item, index) => {
      const row = [
        index + 1,
        item.name,
        item.code,
        item.intime
          ? item.intime.toLocaleTimeString([], {
              hour12: false,
            })
          : "",
        item.outtime
          ? item.outtime.toLocaleTimeString([], {
              hour12: false,
            })
          : "",
        item.isActive ? "Y" : "N",
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("ShiftData.pdf");
  };

  return (
    <>
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
            <FaAngleRight />
            Masters
            <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              Shift
            </div>
          </h1>
          {!openModal && (
            <button
              onClick={() => setOpenModal(true)}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
            >
              + Add New
            </button>
          )}
        </div>

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
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                <tr>
                  <th className="p-2 font-semibold">SL.NO</th>
                  <th className="p-2 font-semibold">Shift Name</th>
                  <th className="p-2 font-semibold">Shift Code</th>
                  <th className="p-2 font-semibold">In Time</th>
                  <th className="p-2 font-semibold">Out Time</th>
                  <th className="p-2 font-semibold">Active</th>
                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentshift.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="lg:text-center p-10 ">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentshift.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                    >
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.code}</td>
                      <td className="p-2">
                        {item.intime
                          ? item.intime.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : ""}
                      </td>
                      <td className="p-2">
                        {item.outtime
                          ? item.outtime.toLocaleTimeString([], {
                              hour12: false,
                            })
                          : ""}
                      </td>
                      <td className="p-2">{item.isActive ? "Y" : "N"}</td>
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
                              setShift(shift.filter((v) => v.id !== item.id))
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
              Showing {filteredshift.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredshift.length)} of{" "}
              {filteredshift.length} entries
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
              {/* Close */}
              <div className="flex justify-end">
                <RxCross2
                  onClick={() => setOpenModal(false)}
                  className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelStyle}>
                    Shift Name
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className={inputStyle}
                    disabled={mode === "view"}
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
                    placeholder="Code"
                    className={inputStyle}
                    disabled={mode === "view"}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    In Time
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <DatePicker
                    disableDayPicker
                    format="HH:mm:ss"
                    value={formData.intime}
                    onChange={(time) =>
                      setFormData({ ...formData, intime: time?.toDate() })
                    }
                    plugins={[<TimePicker header={false} disabledClock />]}
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Out Time
                    <span className="text-[oklch(0.577_0.245_27.325)]">
                      {" "}
                      *{" "}
                    </span>
                  </label>
                  <DatePicker
                    disableDayPicker
                    format="HH:mm:ss"
                    value={formData.outtime}
                    onChange={(time) =>
                      setFormData({ ...formData, outtime: time?.toDate() })
                    }
                    plugins={[<TimePicker header={false} disabledClock />]}
                    className={inputStyle}
                    disabled={mode === "view"}
                  />
                  {/* <DatePicker
                    placeholderText="hh:mm"
                    selected={formData.outtime}
                    onChange={(time) =>
                      setFormData({ ...formData, outtime: time })
                    }
                    showTimeInput
                    showTimeSelectOnly
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="HH:mm:ss"
                    className={inputStyle}
                    disabled={mode === "view"}
                  /> */}
                </div>

                <div>
                  <label className={labelStyle}>Company</label>
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={inputStyle}
                    disabled={mode === "view"}
                    required
                  >
                    <option>Select</option>
                    <option> Company 1</option>
                  </select>
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

export default Shift;
