import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const DeviceManagementSub = () => {
  const [openModal, setOpenModal] = useState(false);
  const [devicemanagement, setDevicemanagement] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
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
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-sm font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const filteredDevicemanagement = devicemanagement.filter(
    (device) =>
      device.deviceserialno
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase()) ||
      device.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      device.deviceip.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      device.company.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(
    filteredDevicemanagement.length / entriesPerPage,
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentdevicemanagement = filteredDevicemanagement.slice(
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
      deviceip,
      deviceserialno,
      isFace,
      isFingerprint,
      isCardNo,
      isPinNo,
      isActive,
    } = formData;

    if (!name || !company || !deviceip) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newdevicemanagement = {
      id: Date.now(),
      name,
      deviceip,
      company,
      deviceserialno,
      isFace,
      isFingerprint,
      isCardNo,
      isPinNo,
      isActive,
    };

    setDevicemanagement((prev) => [...prev, newdevicemanagement]);

    setOpenModal(false);

    setFormData({
      company: "",
      name: "",
      deviceip: "",
      deviceserialno: "",
      longitude: "",
      latitude: "",
      isFace: false,
      isFingerprint: false,
      isCardNo: false,
      isPinNo: false,
      isActive: false,
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
          Device Management
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
                  <th className="p-2 border">Device Serial No</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Device IP</th>
                  <th className="p-2 border">Face</th>
                  <th className="p-2 border">FingerPrint</th>
                  <th className="p-2 border">Card no</th>
                  <th className="p-2 border">Pin no</th>
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Active</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentdevicemanagement.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center p-4">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentdevicemanagement.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{item.deviceserialno}</td>
                      <td className="p-2 border">{item.name}</td>
                      <td className="p-2 border">{item.deviceip}</td>
                      <td className="p-2 border">{item.isFace ? "Y" : "N"}</td>
                      <td className="p-2 border">
                        {item.isFingerprint ? "Y" : "N"}
                      </td>
                      <td className="p-2 border">
                        {item.isCardNo ? "Y" : "N"}
                      </td>
                      <td className="p-2 border">{item.isPinNo ? "Y" : "N"}</td>
                      <td className="p-2 border">{item.company}</td>
                      <td className="p-2 border">
                        {item.isActive ? "Y" : "N"}
                      </td>
                      <td className="p-2 border space-x-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDevicemanagement(
                              devicemanagement.filter((v) => v.id !== item.id),
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
              Showing {Math.min(endIndex, filteredDevicemanagement.length)} of{" "}
              {filteredDevicemanagement.length} entries
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
                Device Serial Number
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="deviceserialno"
                value={formData.deviceserialno}
                onChange={handleChange}
                placeholder="Serial"
                className={inputStyle}
                required
              />
            </div>

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
                Device Model
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="devicemodel"
                value={formData.devicemodel}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option> 1</option>
                <option> 2</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>
                deviceip
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="deviceip"
                value={formData.deviceip}
                onChange={handleChange}
                placeholder="deviceip"
                className={inputStyle}
                required
              />
            </div>

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
              <label className={labelStyle}>Longitude Address</label>
              <input
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="0"
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className={labelStyle}>Latitude Address</label>
              <input
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="0"
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
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Face</label>
              <input
                type="checkbox"
                name="isFace"
                checked={formData.isFace}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>FingerPrint</label>
              <input
                type="checkbox"
                name="isFingerprint"
                checked={formData.isFingerprint}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Card No</label>
              <input
                type="checkbox"
                name="isCardNo"
                checked={formData.isCardNo}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <label className={labelStyle}>Pin No</label>
              <input
                type="checkbox"
                name="isPinNo"
                checked={formData.isPinNo}
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

export default DeviceManagementSub;
