import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const EmployeeCategory = () => {
  const [openModal, setOpenModal] = useState(false);
  const [employeeCategory, setEmployeeCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    code: "",
    description: "",
    workhours: "",
    minworkhours: "",
    maxot: "",
    isActive: false,
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-sm font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredemployeeCategory = employeeCategory.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(
    filteredemployeeCategory.length / entriesPerPage,
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentemployeeCategory = filteredemployeeCategory.slice(
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
      name,
      company,
      code,
      description,
      workhours,
      minworkhours,
      maxot,
      isActive,
    } = formData;

    if (!name || !code) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newemployeeCategory = {
      id: Date.now(),
      name,
      code,
      company,
      description,
      workhours,
      minworkhours,
      maxot,
      isActive,
    };

    setEmployeeCategory((prev) => [...prev, newemployeeCategory]);

    setOpenModal(false);

    setFormData({
      company: "",
      name: "",
      code: "",
      description: "",
      workhours: "",
      minworkhours: "",
      maxot: "",
      isActive: false,
    });

    toast.success("Added");
  };

  const times = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = String(h).padStart(2, "0");
      const min = String(m).padStart(2, "0");
      times.push(`${hour}:${min}:00`);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          EmployeeCategoryMaster
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

      <div className="mt-6 bg-white shadow-xl rounded-xl border border-gray-200 p-4">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div>
            <label className="mr-2 text-sm">Show</label>
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
            <span className="ml-2 text-sm">entries</span>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Sl.No</th>
                <th className="p-2 border">Category Name</th>
                <th className="p-2 border">Category Code</th>
                <th className="p-2 border">Company</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Work Hours</th>
                <th className="p-2 border">Min Work Hours</th>
                <th className="p-2 border">MaxOT</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentemployeeCategory.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4">
                    No Data Available
                  </td>
                </tr>
              ) : (
                currentemployeeCategory.map((item, index) => (
                  <tr key={item.id} className="text-center">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.code}</td>
                    <td className="p-2 border">{item.company}</td>
                    <td className="p-2 border">{item.description}</td>
                    <td className="p-2 border">{item.workhours}</td>
                    <td className="p-2 border">{item.minworkhours}</td>
                    <td className="p-2 border">{item.maxot}</td>
                    <td className="p-2 border">{item.isActive ? "Y" : "N"}</td>
                    <td className="p-2 border space-x-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setEmployeeCategory(
                            employeeCategory.filter((v) => v.id !== item.id),
                          )
                        }
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
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
            Showing {Math.min(endIndex, filteredemployeeCategory.length)} of{" "}
            {filteredemployeeCategory.length} entries
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

      {openModal && (
        <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.923_0.003_48.717)] p-6">
          {/* Close */}
          <div className="flex justify-end">
            <RxCross2
              onClick={() => setOpenModal(false)}
              className="text-[oklch(0.577_0.245_27.325)] text-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>
                Name
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>
                Code
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Code"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>Company</label>
              <select
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option> Company 1</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>
                Description
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>
                Work Hours
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="workhours"
                value={formData.workhours}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">hh-mm-ss</option>
                {times.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelStyle}>
                Min Work Hours
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="minworkhours"
                value={formData.minworkhours}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">hh-mm-ss</option>
                {times.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelStyle}>
                Max OverTime
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="maxot"
                value={formData.maxot}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">hh-mm-ss</option>
                {times.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Active</label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end mt-10">
            <button
              onClick={handleSubmit}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-8 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeCategory;
