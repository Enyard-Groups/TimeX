import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const Department = () => {
  const [openModal, setOpenModal] = useState(false);
  const [department, setDepartment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    code: "",
    description: "",
    isActive: false,
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-sm font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filtereddepartment = department.filter(
    (x) =>
      x.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      x.company.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filtereddepartment.length / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentdepartment = filtereddepartment.slice(startIndex, endIndex);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const { name, company, code, description, isActive } = formData;

    if (!name || !company || !code) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newdepartment = {
      id: Date.now(),
      name,
      code,
      company,
      description,
      isActive,
    };

    setDepartment((prev) => [...prev, newdepartment]);

    setOpenModal(false);

    setFormData({
      company: "",
      name: "",
      code: "",
      description: "",
      isActive: false,
    });

    toast.success("Added");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaAngleRight />
          Masters
          <FaAngleRight />
          <div onClick={() => setOpenModal(false)} className="cursor-pointer">
            DepartmentMaster
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
        <div className="mt-6 bg-white shadow-xl rounded-xl border border-[oklch(0.8_0.001_106.424)] p-4">
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
              <thead className="bg-[oklch(0.948_0.001_106.424)]">
                <tr>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Sl.No
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Department Name
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Department Code
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Company
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Active
                  </th>
                  <th className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentdepartment.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentdepartment.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {index + 1}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.name}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.code}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.company}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)]">
                        {item.isActive ? "Y" : "N"}
                      </td>
                      <td className="p-2 border border-[oklch(0.8_0.001_106.424)] space-x-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDepartment(
                              department.filter((v) => v.id !== item.id),
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
              Showing {Math.min(endIndex, filtereddepartment.length)} of{" "}
              {filtereddepartment.length} entries
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
              <label className={labelStyle}>
                Company
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
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
              <label className={labelStyle}>Description</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
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

export default Department;
