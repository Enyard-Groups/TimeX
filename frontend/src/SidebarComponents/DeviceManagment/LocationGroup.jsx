import React, { useState } from "react";
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
    <div className="mb-16">
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
                <th className="p-2 font-semibold">SL.NO</th>
                <th className="p-2 font-semibold whitespace-nowrap">Location Group Name</th>
                <th className="p-2 font-semibold whitespace-nowrap">
                  Location Group Discription
                </th>
                <th className="p-2 font-semibold whitespace-nowrap">Time Keeper Name</th>
                <th className="p-2 font-semibold whitespace-nowrap">Site Manager Name</th>
                <th className="p-2 font-semibold">Company</th>
                <th className="p-2 font-semibold">Action</th>
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
                    className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)]"
                  >
                    <td className="py-2 px-6">{index + 1}</td>
                    <td className="py-2 px-6 whitespace-nowrap">{item.locationgroupname}</td>
                    <td className="py-2 px-6 whitespace-nowrap">
                      {item.locationgroupdescription}
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">{item.timekeepername}</td>
                    <td className="py-2 px-6 whitespace-nowrap">{item.sitemanagername}</td>
                    <td className="py-2 px-6 whitespace-nowrap">{item.organization}</td>
                    <td className="py-2 px-6">
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
        <div className="flex justify-center md:justify-between items-center mt-4 text-sm flex-wrap gap-6">
          <span>
            Showing {filteredlocationGroup.length === 0 ? "0" : startIndex + 1}{" "}
            to {Math.min(endIndex, filteredlocationGroup.length)} of{" "}
            {filteredlocationGroup.length} entries
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
          style={{ scrollbarWidth: "none" }}>
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
                <SearchDropdown
                  label="Site Manager Name"
                  name="sitemanagername"
                  value={formData.sitemanagername}
                  options={["Name 1", "Name 2", "Name 3"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>

              <div>
                <SearchDropdown
                  label="Time Keeper name"
                  name="timekeepername"
                  value={formData.timekeepername}
                  options={["Name 1", "Name 2", "Name 3"]}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={mode === "view"}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
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

export default LocationGroup;
