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

const LocationGroup = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [locationGroup, setLocationGroup] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    locationgroupname: "",
    company: "",
    discription: "",
    sitemanagername: "",
    timekeepername: "",
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredlocationGroup = locationGroup.filter(
    (locationgroup) =>
      locationgroup.locationgroupname
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      locationgroup.company.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredlocationGroup.length / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentlocationGroup = filteredlocationGroup.slice(
    startIndex,
    endIndex,
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const {
      locationgroupname,
      company,
      discription,
      sitemanagername,
      timekeepername,
    } = formData;

    if (
      !locationgroupname ||
      !company ||
      !discription ||
      !sitemanagername ||
      !timekeepername
    ) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newlocationgroup = {
      id: Date.now(),
      locationgroupname,
      locationgroupdescription: discription,
      timekeepername,
      sitemanagername,
      organization: company,
    };

    if (editId) {
      setLocationGroup((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setLocationGroup((prev) => [...prev, newlocationgroup]);

      toast.success("Data Added");
    }

    setOpenModal(false);
    setEditId(null);

    setFormData({
      company: "",
      locationgroupname: "",
      discription: "",
      sitemanagername: "",
      timekeepername: "",
    });
  };
  const handleCopy = () => {
    const header =
      "SL.NO\tLocation Group Name\tLocation Group Description\tTime Keeper Name\tSite Manager Name\tCompany";

    const rows = filteredlocationGroup
      .map(
        (d, i) =>
          `${i + 1}\t${d.locationgroupname}\t${d.locationgroupdescription}\t${d.timekeepername}\t${d.sitemanagername}\t${d.organization}`,
      )
      .join("\n");

    const text = header + "\n" + rows;

    navigator.clipboard.writeText(text);

    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredlocationGroup.map((d, i) => ({
      "SL.NO": i + 1,
      "Location Group Name": d.locationgroupname,
      "Location Group Description": d.locationgroupdescription,
      "Time Keeper Name": d.timekeepername,
      "Site Manager Name": d.sitemanagername,
      Company: d.organization,
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
      d.locationgroupname,
      d.locationgroupdescription,
      d.timekeepername,
      d.sitemanagername,
      d.organization,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("LocationGroup.pdf");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <FaAngleRight />
          Device Management
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            Location Group
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

      {!openModal && (
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
              </select>
              <span className="ml-2 text-md">entries</span>
            </div>
            <div className="flex">
              <button
                onClick={handleCopy}
                className="px-3 py-1 cursor-pointer text-gray-800"
              >
                <GoCopy />
              </button>

              <button
                onClick={handleExcel}
                className="px-3 py-1 cursor-pointer text-green-700"
              >
                <FaFileExcel />
              </button>

              <button
                onClick={handlePDF}
                className="px-3 py-1 cursor-pointer text-red-600"
              >
                <FaFilePdf />
              </button>
            </div>
            <input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className=" shadow-sm px-3 py-1 rounded-full  focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-lg border-collapse">
              <thead className="bg-[oklch(0.948_0.001_106.424)]">
                <tr>
                  <th className="py-2 px-6">SL.NO</th>
                  <th className="py-2 px-6">Location Group Name</th>
                  <th className="py-2 px-6">Location Group Discription</th>
                  <th className="py-2 px-6">Time Keeper Name</th>
                  <th className="py-2 px-6">Site Manager Name</th>
                  <th className="py-2 px-6">Company</th>
                  <th className="py-2 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentlocationGroup.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="sm:text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentlocationGroup.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] "
                    >
                      <td className="py-2 px-6">{index + 1}</td>
                      <td className="py-2 px-6">{item.locationgroupname}</td>
                      <td className="py-2 px-6">
                        {item.locationgroupdescription}
                      </td>
                      <td className="py-2 px-6">{item.timekeepername}</td>
                      <td className="py-2 px-6">{item.sitemanagername}</td>
                      <td className="py-2 px-6">{item.organization}</td>
                      <td className="py-2 px-6">
                        <div className="flex flex-row space-x-3 ">
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
                              setLocationGroup(
                                locationGroup.filter((v) => v.id !== item.id),
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
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>
              Showing {Math.min(endIndex, filteredlocationGroup.length)} of{" "}
              {filteredlocationGroup.length} entries
            </span>

            <div className="space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-2 py-1 rounded ${
                    currentPage === index + 1
                      ? "bg-green-500 text-white"
                      : "border"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.923_0.003_48.717)] p-6">
          {/* Close */}
          <div className="flex justify-end">
            <RxCross2
              onClick={() => setOpenModal(false)}
              className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
            />
          </div>

          {/* LOCATION GROUP INFORMATION */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>
                Company
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

            <div>
              <label className={labelStyle}>
                Location Group Name
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="locationgroupname"
                value={formData.locationgroupname}
                onChange={handleChange}
                disabled={mode === "view"}
                placeholder="Location Group Name"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>
                Discription
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="discription"
                value={formData.discription}
                onChange={handleChange}
                disabled={mode === "view"}
                placeholder="Discription"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>
                Site Manager Name
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="sitemanagername"
                value={formData.sitemanagername}
                onChange={handleChange}
                disabled={mode === "view"}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option>Name 1</option>
                <option>Name 2</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>
                Time Keeper Name
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="timekeepername"
                value={formData.timekeepername}
                onChange={handleChange}
                disabled={mode === "view"}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option>Name 1</option>
                <option>Name 2</option>
              </select>
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
      )}
    </>
  );
};

export default LocationGroup;
