import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const LocationGroup = () => {
  const [openModal, setOpenModal] = useState(false);
  const [locationGroup, setLocationGroup] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    locationgroupname: "",
    company: "",
    discription: "",
    sitemanagername: "",
    timekeepername: "",
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-sm font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

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

    setLocationGroup((prev) => [...prev, newlocationgroup]);

    setOpenModal(false);

    setFormData({
      company: "",
      locationgroupname: "",
      discription: "",
      sitemanagername: "",
      timekeepername: "",
    });

    toast.success("Location added");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaAngleRight />
          Device Management
          <FaAngleRight />
          Location Group
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
              placeholder="Search by Location Group Name..."
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
                  <th className="p-2 border">Location Group Name</th>
                  <th className="p-2 border">Location Group Discription</th>
                  <th className="p-2 border">Time Keeper Name</th>
                  <th className="p-2 border">Site Manager Name</th>
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentlocationGroup.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-4">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentlocationGroup.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{item.locationgroupname}</td>
                      <td className="p-2 border">
                        {item.locationgroupdescription}
                      </td>
                      <td className="p-2 border">{item.timekeepername}</td>
                      <td className="p-2 border">{item.sitemanagername}</td>
                      <td className="p-2 border">{item.organization}</td>
                      <td className="p-2 border space-x-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setLocationGroup(
                              locationGroup.filter((v) => v.id !== item.id),
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

export default LocationGroup;
