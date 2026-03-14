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
import SearchDropdown from "../SearchDropdown";

const UserMaster = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuData, setMenuData] = useState([
    {
      parentMenuID: 0,
      menuID: 100,
      menuName: "DASHBOARD",
      url: "/dashboard",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 200,
      menuName: "MASTERS",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 300,
      menuName: "DEVICE MANAGEMENT",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 400,
      menuName: "TRANSACTION",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 500,
      menuName: "GEOFENCING",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 600,
      menuName: "REQUESTS",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 700,
      menuName: "REPORTS",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 800,
      menuName: "VISITOR MANAGEMENT",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 0,
      menuID: 900,
      menuName: "FORMS",
      url: "#",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2003,
      menuName: "DEPARTMENT",
      url: "/masters/department",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2004,
      menuName: "DESIGNATION",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2005,
      menuName: "SHIFT",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2006,
      menuName: "EMPLOYEE",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2007,
      menuName: "USER MASTER",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2008,
      menuName: "ISSUE TYPE",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2010,
      menuName: "HOLIDAY",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2013,
      menuName: "CLAIM CATEGORY",
      url: "/masters/",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3001,
      menuName: "LOCATION GROUP",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3002,
      menuName: "DEVICE COMMUNICATION",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3003,
      menuName: "DEVICE MANAGEMENT",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3004,
      menuName: "DEVICE MODEL",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 400,
      menuID: 4001,
      menuName: "MONITORING",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 4002,
      menuName: "MANNUAL ENRTY REQUEST",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 70132,
      menuID: 4003,
      menuName: "MANNUAL ENTRY APPROVAL",
      url: "",
      isSelected: false,
    },
    {
      parentMenuID: 400,
      menuID: 4004,
      menuName: "SHIFT PLANNER",
      url: "",
      isSelected: false,
    },
  ]);

  const [formData, setFormData] = useState({
    userName: "",
    empname: "",
    enrollmentId: "",
    company: "",
    password: "",
    active: false,
    role: "Company Admin",
  });

  const inputStyle =
    "text-lg w-full border border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-md focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle = "text-lg font-medium mb-1 block";

  const filteredUsers = users.filter(
    (u) =>
      u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.empname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.userName || !formData.company || !formData.empname) {
      toast.error("Please fill required fields");
      return;
    }

    const newUser = {
      id: Date.now(),
      ...formData,
    };

    if (editId) {
      setUsers((prev) =>
        prev.map((emp) => (emp.id === editId ? { ...emp, ...formData } : emp)),
      );

      toast.success("Data updated");
    } else {
      setUsers((prev) => [...prev, newUser]);

      toast.success("Data Added");
    }

    setOpenModal(false);
    setEditId(null);
    setActiveTab("details");

    setFormData({
      userName: "",
      empname: "",
      enrollmentId: "",
      company: "",
      password: "",
      active: false,
      role: "User",
    });
  };

  const handleCheckbox = (id) => {
    setMenuData((prev) =>
      prev.map((menu) =>
        menu.menuID === id ? { ...menu, isSelected: !menu.isSelected } : menu,
      ),
    );
  };

  const handleCopy = () => {
    const header = "SL.NO\tUser Name\tEmployee\tEmployee Email\tRole\tActive";

    const rows = filteredUsers
      .map(
        (u, i) =>
          `${i + 1}\t${u.userName}\t${u.empname}\t${u.enrollmentId}\t${u.role}\t${
            u.active ? "Y" : "N"
          }`,
      )
      .join("\n");

    const text = header + "\n" + rows;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const data = filteredUsers.map((u, i) => ({
      "SL.NO": i + 1,
      "User Name": u.userName,
      Employee: u.empname,
      "Employee Email": u.enrollmentId,
      Role: u.role,
      Active: u.active ? "Y" : "N",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    XLSX.writeFile(workbook, "UserMaster.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.NO",
      "User Name",
      "Employee",
      "Employee Email",
      "Role",
      "Active",
    ];

    const tableRows = filteredUsers.map((u, i) => [
      i + 1,
      u.userName,
      u.empname,
      u.enrollmentId,
      u.role,
      u.active ? "Y" : "N",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("UserMaster.pdf");
  };

  return (
    <>
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <FaAngleRight /> Masters <FaAngleRight />
            <div onClick={() => setOpenModal(false)} className="cursor-pointer">
              User Master
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

                  <th className="p-2 font-semibold">User Name</th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Employee
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Employee Email
                  </th>

                  <th className="p-2 font-semibold hidden md:table-cell">
                    Role
                  </th>

                  <th className="p-2 font-semibold hidden lg:table-cell">
                    Active
                  </th>

                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="sm:text-center p-10">
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="text-center border-b border-[oklch(0.8_0.001_106.424)] even:bg-[oklch(0.99_0.01_16.439)] text-[oklch(0.33_0.001_106.424)] "
                    >
                      <td className="p-2 hidden sm:table-cell">{index + 1}</td>

                      <td className="p-2 ">{user.userName}</td>

                      <td className="p-2  hidden md:table-cell">
                        {user.empname}
                      </td>

                      <td className="p-2  hidden lg:table-cell">
                        {user.enrollmentId}
                      </td>

                      <td className="p-2  hidden md:table-cell">{user.role}</td>

                      <td className="p-2 hidden lg:table-cell">
                        {user.active ? "Y" : "N"}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-row space-x-3 justify-center ">
                          {/* View */}
                          <FaEye
                            onClick={() => {
                              setFormData(user);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="inline text-blue-500 cursor-pointer text-lg"
                          />

                          {/* Edit */}
                          <FaPen
                            onClick={() => {
                              setFormData(user);
                              setEditId(user.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="inline text-green-500 cursor-pointer text-lg"
                          />

                          {/* Delete */}
                          <MdDeleteForever
                            onClick={() =>
                              setUsers(users.filter((v) => v.id !== user.id))
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
              Showing {filteredUsers.length === 0 ? "0" : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} entries
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
              <div className="flex justify-between items-center border-b pb-3 mb-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`${
                      activeTab === "details"
                        ? "text-[oklch(0.645_0.246_16.439)] border-b-2 border-[oklch(0.645_0.246_16.439)]"
                        : ""
                    }`}
                  >
                    User Details
                  </button>

                  <button
                    onClick={() => setActiveTab("roles")}
                    className={`${
                      activeTab === "roles"
                        ? "text-[oklch(0.645_0.246_16.439)] border-b-2 border-[oklch(0.645_0.246_16.439)]"
                        : ""
                    }`}
                  >
                    User Roles
                  </button>

                  <button
                    onClick={() => setActiveTab("menu")}
                    className={`${
                      activeTab === "menu"
                        ? "text-[oklch(0.645_0.246_16.439)] border-b-2 border-[oklch(0.645_0.246_16.439)]"
                        : ""
                    }`}
                  >
                    User Menu
                  </button>
                </div>

                <RxCross2
                  onClick={() => (
                    setOpenModal(false),
                    setFormData({
                      userName: "",
                      empname: "",
                      enrollmentId: "",
                      company: "",
                      password: "",
                      active: false,
                      role: "User",
                    })
                  )}
                  className="cursor-pointer text-lg text-red-500"
                />
              </div>

              {/* -------- TAB CONTENT -------- */}

              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>
                      User Name{" "}
                      <span className="text-[oklch(0.577_0.245_27.325)]">
                        {" "}
                        *{" "}
                      </span>
                    </label>
                    <input
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Employee Name{" "}
                      <span className="text-[oklch(0.577_0.245_27.325)]">
                        {" "}
                        *{" "}
                      </span>
                    </label>
                    <input
                      name="empname"
                      value={formData.empname}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Enrollment ID | Email</label>
                    <input
                      name="enrollmentId"
                      value={formData.enrollmentId}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <SearchDropdown
                      label={
                        <>
                          Company <span className="text-red-500">*</span>
                        </>
                      }
                      name="company"
                      value={formData.company}
                      options={["Company 1", "Company 2"]}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                      labelStyle={labelStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={inputStyle}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <label className={labelStyle}>Active</label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                  </div>
                </div>
              )}

              {activeTab === "roles" && (
                <div>
                  <SearchDropdown
                    label={
                      <>
                        User Role <span className="text-red-500">*</span>
                      </>
                    }
                    name="role"
                    value={formData.role}
                    options={["Company Admin", "Manager / Approver", "User"]}
                    formData={formData}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />
                </div>
              )}

              {activeTab === "menu" && (
                <div className="w-full border border-[oklch(0.8_0.001_106.424)] rounded-md overflow-hidden">
                  {/* Header */}
                  <div className="bg-[oklch(0.645_0.246_16.439)] text-white text-center font-semibold py-2">
                    Select Menu to give the Access to the Current User:
                  </div>

                  {/* Table */}
                  <div
                    className="overflow-auto max-h-[600px]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-[oklch(0.94_0.001_106.424)] text-[oklch(0.44_0.001_106.424)]">
                        <tr>
                          <th className="border border-[oklch(0.8_0.001_106.424)] p-2 w-10"></th>

                          <th className="border border-[oklch(0.8_0.001_106.424)] p-2 hidden md:table-cell">
                            ParentMenu ID
                          </th>

                          <th className="border border-[oklch(0.8_0.001_106.424)] p-2 hidden sm:table-cell">
                            Menu ID
                          </th>

                          <th className="border border-[oklch(0.8_0.001_106.424)] p-2 text-left">
                            Menu Name
                          </th>

                          <th className="border border-[oklch(0.8_0.001_106.424)] p-2 text-left hidden md:table-cell">
                            URL
                          </th>

                          <th className="border border-[oklch(0.8_0.001_106.424)] p-2 hidden sm:table-cell">
                            IsSelected
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {menuData.map((menu, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-[oklch(0.8_0.001_106.424)] p-2 text-center">
                              <input
                                type="checkbox"
                                checked={menu.isSelected}
                                disabled={mode === "view"}
                                onChange={() => handleCheckbox(menu.menuID)}
                              />
                            </td>

                            <td className="border border-[oklch(0.8_0.001_106.424)] p-2 text-center hidden md:table-cell">
                              {menu.parentMenuID}
                            </td>

                            <td className="border border-[oklch(0.8_0.001_106.424)] p-2 text-center hidden sm:table-cell">
                              {menu.menuID}
                            </td>

                            <td className="border border-[oklch(0.8_0.001_106.424)] p-2">
                              {menu.menuName}
                            </td>

                            <td className="border border-[oklch(0.8_0.001_106.424)] p-2 hidden md:table-cell">
                              {menu.url}
                            </td>

                            <td className="border border-[oklch(0.8_0.001_106.424)] p-2 text-center hidden sm:table-cell">
                              {menu.isSelected ? "True" : "False"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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

export default UserMaster;
