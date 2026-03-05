import React, { useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const VisitorBooking = () => {
  const [openModal, setOpenModal] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    searchType: "Mobile no.",
    searchValue: "",
    visitorName: "",
    purpose: "",
    visitDate: today,
    visitTime: currentTime,
    company: "",
    mobile: "",
    contactPerson: "",
    email: "",
    cicpaCard: "",
    companyCode: "",
    cicpaExpiry: "",
    idType: "EID",
    idNumber: "",
    nationality: "",
    idExpiry: "",
    accessCard: "",
    isPermanent: false,
  });

  const inputStyle =
    "w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-sm font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const handleSearch = () => {
    const { searchType, searchValue } = formData;

    if (!searchValue) {
      toast.error("Please enter search value");
      return;
    }

    let filtered = visitors;

    switch (searchType) {
      case "Mobile no.":
        filtered = visitors.filter((v) =>
          v.phone?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "Visitor":
        filtered = visitors.filter((v) =>
          v.visitorName?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "CICPA no.":
        filtered = visitors.filter((v) =>
          v.cicpaCard?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "EID no.":
        filtered = visitors.filter((v) =>
          v.idNumber?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      case "QR Code":
        filtered = visitors.filter((v) =>
          v.visitorCode?.toLowerCase().includes(searchValue.toLowerCase()),
        );
        break;

      default:
        break;
    }

    if (filtered.length === 0) {
      toast.error("No data found");
      return;
    }

    setVisitors(filtered); // Show filtered data in table
    setOpenModal(false); // Close modal
    setCurrentPage(1); // reset pagination
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.visitorName.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredVisitors.length / entriesPerPage);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentVisitors = filteredVisitors.slice(startIndex, endIndex);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const {
      visitorName,
      purpose,
      company,
      mobile,
      contactPerson,
      accessCard,
      visitDate,
      visitTime,
    } = formData;

    if (
      !visitorName ||
      !purpose ||
      !company ||
      !mobile ||
      !contactPerson ||
      !accessCard
    ) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    const newVisitor = {
      id: Date.now(),
      visitorCode: `VS-${visitors.length + 1}`,
      visitorName,
      phone: mobile,
      cardReference: accessCard,
      vDateTime: visitDate + " (" + visitTime + ")",
      organization: company,
      meetingPerson: contactPerson,
    };

    setVisitors((prev) => [...prev, newVisitor]);

    setOpenModal(false);

    setFormData({
      searchType: "Mobile no.",
      visitorName: "",
      visitDate: today,
      visitTime: currentTime,
      purpose: "",
      company: "",
      mobile: "",
      contactPerson: "",
      email: "",
      cicpaCard: "",
      companyCode: "",
      cicpaExpiry: "",
      idType: "EID",
      idNumber: "",
      nationality: "",
      idExpiry: "",
      accessCard: "",
      isPermanent: false,
    });

    toast.success("Visitor Booking Successfully Done");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FaAngleRight />
          Visitor
          <FaAngleRight />
          Visitor Booking
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
              placeholder="Search by Visitor Name..."
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
                  <th className="p-2 border">Visitor Code</th>
                  <th className="p-2 border">Visitor Name</th>
                  <th className="p-2 border">V-Phone</th>
                  <th className="p-2 border">CardReference</th>
                  <th className="p-2 border">V-Date & Time</th>
                  <th className="p-2 border">Organization</th>
                  <th className="p-2 border">Meeting Person</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-4">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentVisitors.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{item.visitorCode}</td>
                      <td className="p-2 border">{item.visitorName}</td>
                      <td className="p-2 border">{item.phone}</td>
                      <td className="p-2 border">{item.cardReference}</td>
                      <td className="p-2 border">{item.vDateTime}</td>
                      <td className="p-2 border">{item.organization}</td>
                      <td className="p-2 border">{item.meetingPerson}</td>
                      <td className="p-2 border space-x-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setVisitors(
                              visitors.filter((v) => v.id !== item.id),
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
              Showing {Math.min(endIndex, filteredVisitors.length)} of{" "}
              {filteredVisitors.length} entries
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

          {/* Search Section */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <select
              name="searchType"
              value={formData.searchType}
              onChange={handleChange}
              className={inputStyle}
            >
              <option>Mobile no.</option>
              <option>CICPA no.</option>
              <option>EID no.</option>
              <option>Visitor</option>
              <option>QR Code</option>
            </select>

            <input
              name="searchValue"
              value={formData.searchValue}
              onChange={handleChange}
              placeholder="Value"
              className={inputStyle}
              required
            />

            <button
              onClick={handleSearch}
              className="bg-[oklch(0.645_0.246_16.439)] text-white px-4 py-2 rounded-md"
            >
              Search
            </button>
          </div>

          {/* VISITOR INFORMATION */}
          <h2 className="text-center font-semibold mt-8 mb-4">
            VISITOR INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className={labelStyle}>
                Visitor Name
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                name="visitorName"
                value={formData.visitorName}
                onChange={handleChange}
                placeholder="Visitor Name"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>
                Purpose Of Visit
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option>Business</option>
                <option>Meeting</option>
                <option>Interview</option>
                <option>Contractor</option>
                <option>Personal</option>
                <option>Delivery</option>
              </select>
            </div>

            <div className="grid grid-cols-2">
              <div>
                <label className={labelStyle}>Date</label>
                <div
                  name="visitDate"
                  value={formData.visitDate}
                  className={inputStyle}
                >
                  {formData.visitDate}
                </div>
              </div>

              <div>
                <label className={labelStyle}>Time</label>
                <div
                  name="visitTime"
                  value={formData.visitTime}
                  className={inputStyle}
                >
                  {formData.visitTime}
                </div>
              </div>
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
              <label className={labelStyle}>
                Mobile No
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <input
                type="number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Contact No"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>
                F1 Point of Contact
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option>Name1</option>
                <option>name2</option>
                <option>Name3</option>
                <option>Name4</option>
                <option>Name5</option>
                <option>Name6</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>E-Mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-Mail"
                className={inputStyle}
                required
              />
            </div>
          </div>

          {/* CICPA SECTION */}
          <h2 className="text-center font-semibold mt-10 mb-4">
            CICPA INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className={labelStyle}>CICPA Card No</label>
              <input
                name="cicpaCard"
                value={formData.cicpaCard}
                onChange={handleChange}
                placeholder="CICPA Card Number"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>Company Code</label>
              <input
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                placeholder="Company Code"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>CICPA Expiry Date</label>
              <input
                type="date"
                name="cicpaExpiry"
                value={formData.cicpaExpiry}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>

          {/* ID SECTION */}
          <h2 className="text-center font-semibold mt-10 mb-4">
            ID INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className={labelStyle}>Id Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option>EID</option>
                <option>Passport</option>
                <option>Driving License</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Number</label>
              <input
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="ID Number"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>Nationality</label>
              <input
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Nationality"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>Expiry Date</label>
              <input
                type="date"
                name="idExpiry"
                value={formData.idExpiry}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>

          {/* ACCESS CARD */}
          <h2 className="text-center font-semibold mt-10 mb-4">
            ACCESS CARD INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>
                Access Card
                <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
              </label>
              <select
                name="accessCard"
                value={formData.accessCard}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option>Select</option>
                <option>Card 1</option>
                <option>Card 2</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="isPermanent"
                checked={formData.isPermanent}
                onChange={handleChange}
                required
              />
              <span>Is Permanent</span>
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

export default VisitorBooking;
