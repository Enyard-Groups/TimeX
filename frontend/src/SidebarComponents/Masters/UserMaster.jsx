import React, { useState, useEffect } from "react";
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
import axios from "axios";

const UserMaster = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [menuData, setMenuData] = useState([
    // ── TOP-LEVEL PARENTS ──────────────────────────────────────────────
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
      parentMenuID: 0,
      menuID: 1000,
      menuName: "APPROVALS",
      url: "#",
      isSelected: false,
    },

    // ── 200 · MASTERS ─────────────────────────────────────────────────
    {
      parentMenuID: 200,
      menuID: 2001,
      menuName: "COMPANIES",
      url: "/masters/companies",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2002,
      menuName: "LEAVE",
      url: "/masters/leave",
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
      url: "/masters/designation",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2005,
      menuName: "SHIFT",
      url: "/masters/shift",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2006,
      menuName: "EMPLOYEE MASTER",
      url: "/masters/employee-master",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2007,
      menuName: "USER MASTER",
      url: "/masters/user-master",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2008,
      menuName: "ISSUE TYPE",
      url: "/masters/issue-type",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2009,
      menuName: "EMPLOYEE CATEGORY",
      url: "/masters/employee-category",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2010,
      menuName: "HOLIDAY",
      url: "/masters/holiday-master",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2011,
      menuName: "PERFORMANCE REPORT",
      url: "/masters/performance-report",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2012,
      menuName: "PERFORMANCE DASHBOARD",
      url: "/masters/performance-dashboard",
      isSelected: false,
    },
    {
      parentMenuID: 200,
      menuID: 2013,
      menuName: "CLAIM CATEGORY",
      url: "/masters/claim-category",
      isSelected: false,
    },

    // ── 300 · DEVICE MANAGEMENT ───────────────────────────────────────
    {
      parentMenuID: 300,
      menuID: 3001,
      menuName: "LOCATION GROUP",
      url: "/device/location-group",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3002,
      menuName: "DEVICE COMMUNICATION",
      url: "/device/device-communication",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3003,
      menuName: "DEVICE MANAGEMENT",
      url: "/device/device-management",
      isSelected: false,
    },
    {
      parentMenuID: 300,
      menuID: 3004,
      menuName: "DEVICE MODEL",
      url: "/device/device-model",
      isSelected: false,
    },

    // ── 400 · TRANSACTION ─────────────────────────────────────────────
    {
      parentMenuID: 400,
      menuID: 4001,
      menuName: "MONITORING",
      url: "/transaction/monitoring",
      isSelected: false,
    },
    {
      parentMenuID: 400,
      menuID: 4004,
      menuName: "SHIFT PLANNER",
      url: "/transaction/shift-planner",
      isSelected: false,
    },
    {
      parentMenuID: 400,
      menuID: 4005,
      menuName: "SHIFT UPLOAD",
      url: "/transaction/shift-upload",
      isSelected: false,
    },

    // ── 500 · GEOFENCING ──────────────────────────────────────────────
    {
      parentMenuID: 500,
      menuID: 5001,
      menuName: "GEOFENCING MASTER",
      url: "/geofencing/geofencing-master",
      isSelected: false,
    },
    {
      parentMenuID: 500,
      menuID: 5002,
      menuName: "EMPLOYEE GEOFENCING",
      url: "/geofencing/employee-geofencing",
      isSelected: false,
    },

    // ── 600 · REQUESTS ────────────────────────────────────────────────
    {
      parentMenuID: 600,
      menuID: 6001,
      menuName: "MANUAL ENTRY REQUEST",
      url: "/requests/mannual-entry-req",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 6002,
      menuName: "LEAVE REQUEST",
      url: "/requests/leave-req",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 6003,
      menuName: "CLAIM REQUEST",
      url: "/requests/claim-req",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 6004,
      menuName: "BUSINESS TRAVEL REQUEST",
      url: "/requests/business-travel-req",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 6005,
      menuName: "LEAVE SUMMARY",
      url: "/requests/leave-summary",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 6006,
      menuName: "WFH REQUEST",
      url: "/requests/wfh-req",
      isSelected: false,
    },
    {
      parentMenuID: 600,
      menuID: 6007,
      menuName: "WFH SUMMARY",
      url: "/requests/wfh-summary",
      isSelected: false,
    },

    // ── 700 · REPORTS ─────────────────────────────────────────────────
    {
      parentMenuID: 700,
      menuID: 7001,
      menuName: "EMPLOYEE REPORT",
      url: "/reports/employee-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7002,
      menuName: "ALL TRANSACTION REPORT",
      url: "/reports/all-transaction-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7003,
      menuName: "ATTENDANCE BY EMPLOYEE",
      url: "/reports/attendance-by-employee",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7004,
      menuName: "ATTENDANCE BY LOCATION",
      url: "/reports/attendance-by-location",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7005,
      menuName: "ATTENDANCE SUMMARY",
      url: "/reports/attendance-summary",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7006,
      menuName: "ATTENDANCE SUMMARY LOCATION",
      url: "/reports/attendance-summary-location",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7007,
      menuName: "EXCEPTION REPORTS",
      url: "/reports/exception-reports",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7008,
      menuName: "ABSENCE REPORT",
      url: "/reports/absence-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7009,
      menuName: "ABSENCE SUMMARY REPORT",
      url: "/reports/absence-summary-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7010,
      menuName: "IN OUT REPORT",
      url: "/reports/in-out-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7011,
      menuName: "EARLY OUT REPORT",
      url: "/reports/early-out-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7012,
      menuName: "LEAVE MONTHLY SUMMARY",
      url: "/reports/leave-montly-summary",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7013,
      menuName: "LEAVE SUMMARY DATEWISE",
      url: "/reports/leave-summary-datewise",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7014,
      menuName: "WFH REPORT",
      url: "/reports/wft-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7015,
      menuName: "CLAIMS REPORT",
      url: "/reports/claims-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7016,
      menuName: "MANUAL ENTRY STATUS",
      url: "/reports/mannual-entry-status",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7017,
      menuName: "MANUAL ENTRY REPORT",
      url: "/reports/mannual-entry-report",
      isSelected: false,
    },
    {
      parentMenuID: 700,
      menuID: 7018,
      menuName: "MANUAL ENTRY SUMMARY",
      url: "/reports/mannual-entry-summary",
      isSelected: false,
    },

    // ── 800 · VISITOR MANAGEMENT ──────────────────────────────────────
    {
      parentMenuID: 800,
      menuID: 8001,
      menuName: "VISITOR BOOKING",
      url: "/visitor/visitor-booking",
      isSelected: false,
    },
    {
      parentMenuID: 800,
      menuID: 8002,
      menuName: "CARD DETACH",
      url: "/visitor/card-detach",
      isSelected: false,
    },

    // ── 900 · FORMS ───────────────────────────────────────────────────
    {
      parentMenuID: 900,
      menuID: 9001,
      menuName: "MONTHLY FIRE SAFETY INSPECTIONS",
      url: "/forms/monthly-fire-safety-inspections",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9002,
      menuName: "INCIDENT ACCIDENT",
      url: "/forms/incident-accident",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9003,
      menuName: "LEAVE APPLICATION",
      url: "/forms/leave-application",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9004,
      menuName: "OPT OUT REQUEST FORM",
      url: "/forms/opt-out-req-form",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9005,
      menuName: "PASSPORT REQUEST",
      url: "/forms/passport-req",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9006,
      menuName: "SHIFT HAND OVER",
      url: "/forms/shift-hand-over",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9007,
      menuName: "STAFF TRAINING CHECKLIST",
      url: "/forms/staff-training-checklist",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9008,
      menuName: "TPC FORM",
      url: "/forms/tpc-form",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9009,
      menuName: "WEEKLY OVERTIME FORM",
      url: "/forms/weekly-overtime-form",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9010,
      menuName: "PATROLLING CHECKLIST",
      url: "/forms/patolling-checklist",
      isSelected: false,
    },
    {
      parentMenuID: 900,
      menuID: 9011,
      menuName: "FACILITY COMPLAINT FORM",
      url: "/forms/facility-complaint-form",
      isSelected: false,
    },

    // ── 1000 · APPROVALS ──────────────────────────────────────────────
    {
      parentMenuID: 1000,
      menuID: 10001,
      menuName: "MANUAL ENTRY APPROVAL",
      url: "/approval/mannual-entry-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10002,
      menuName: "LEAVE REQUEST APPROVAL",
      url: "/approval/leave-req-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10003,
      menuName: "BUSINESS TRAVEL APPROVAL",
      url: "/approval/bussiness-travel-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10004,
      menuName: "WFH APPROVAL",
      url: "/approval/wfh-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10005,
      menuName: "CLAIM APPROVAL",
      url: "/approval/claim-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10006,
      menuName: "MONTHLY FIRE SAFETY APPROVAL",
      url: "/approval/monthly-fire-safety-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10007,
      menuName: "INCIDENT ACCIDENT APPROVAL",
      url: "/approval/incident-accident-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10008,
      menuName: "LEAVE APPLICATION APPROVAL",
      url: "/approval/leave-application-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10009,
      menuName: "OPT OUT REQUEST APPROVAL",
      url: "/approval/opt-out-request-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10010,
      menuName: "PASSPORT REQUEST APPROVAL",
      url: "/approval/passport-request-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10011,
      menuName: "SHIFT HAND OVER APPROVAL",
      url: "/approval/shift-hand-over-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10012,
      menuName: "STAFF TRAINING CHECKLIST APPROVAL",
      url: "/approval/staff-training-checklist-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10013,
      menuName: "TPC APPROVAL",
      url: "/approval/tpc-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10014,
      menuName: "WEEKLY OVERTIME APPROVAL",
      url: "/approval/weekly-overtime-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10015,
      menuName: "PATROLLING CHECKLIST APPROVAL",
      url: "/approval/patrolling-checklist-approval",
      isSelected: false,
    },
    {
      parentMenuID: 1000,
      menuID: 10016,
      menuName: "FACILITY COMPLAINT FORM APPROVAL",
      url: "/approval/facility-complaint-form-approval",
      isSelected: false,
    },
  ]);

  const [formData, setFormData] = useState({
    userName: "",
    empname: "",
    enrollmentId: "",
    company: "",
    company_name: "",
    password: "",
    active: false,
    role: "Company Admin",
  });

  const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";

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

  const handleSubmit = async () => {
    if (!formData.userName || !formData.company || !formData.empname) {
      toast.error("Please fill required fields");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (editId) {
        await fetch(`${API_BASE}/users/${editId}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            user_name: formData.userName,
            emp_name: formData.empname,
            enrollment_id: formData.enrollmentId,
            company: formData.company,
            password: formData.password,
            role: formData.role,
            active: formData.active,
          }),
        });

        toast.success("User updated");
      } else {
        const res = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            user_name: formData.userName,
            emp_name: formData.empname,
            enrollment_id: formData.enrollmentId,
            company: formData.company,
            password: formData.password,
            role: formData.role,
            roll: formData.role,
            active: formData.active,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create user");
        }

        toast.success("User created successfully");
      }

      setOpenModal(false);
      setEditId(null);
      setActiveTab("details");
      setFormData({
        userName: "",
        empname: "",
        enrollmentId: "",
        company: "",
        company_name: "",
        password: "",
        active: false,
        role: "User",
      });

      // refresh list from server
      fetchUsers();
    } catch (error) {
      console.error("User save error", error);
      toast.error(error.message || "Unable to save user");
    }
  };

  const API_BASE = "http://localhost:3000/api";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE}/users`, {
        method: "GET",
        credentials: "include",
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const usersFromApi = Array.isArray(data) ? data : data?.users || [];

      const mappedUsers = usersFromApi.map((u) => ({
        id: u.id,
        userName: u.user_name || u.userName || "",
        empname: u.emp_name || u.empname || "",
        enrollmentId: u.enrollment_id || u.enrollmentId || "",
        company: u.company || "",
        password: "",
        role: u.role || "",
        active: u.active === true || u.active === "true" || u.active === 1,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    axios
      .get(`${API_BASE}/companies`)
      .then((res) => setCompanyOptions(res.data || []))
      .catch((err) => console.error("Failed to fetch companies", err));
  }, []);

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
      <div className="mb-6 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Masters</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              User Master
            </div>
          </h1>

          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => (
                  setMode(""),
                  setEditId(null),
                  setFormData({
                    userName: "",
                    empname: "",
                    enrollmentId: "",
                    company: "",
                    company_name: "",
                    password: "",
                    active: false,
                    role: "User",
                  }),
                  setOpenModal(true)
                )}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                + Add New
              </button>
            </div>
          )}
        </div>

        {/* Main Container */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-blue-100/50 shadow-xl">
          {/* Top Controls */}
          <div className="p-6 border-b border-blue-100/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm xl:text-base font-medium text-gray-600">
                  Display
                </label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-blue-50 border border-blue-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-300 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm xl:text-base font-medium text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 bg-blue-50 border border-blue-200 text-gray-900 px-4 py-2 xl:text-base  rounded-lg text-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:bg-blue-100 focus:border-blue-300 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 p-2.5 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    <GoCopy className="text-lg xl:text-xl" />
                  </button>
                  <button
                    onClick={handleExcel}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 hover:text-green-700 p-2.5 rounded-lg transition-all"
                    title="Export to Excel"
                  >
                    <FaFileExcel className="text-lg xl:text-xl" />
                  </button>
                  <button
                    onClick={handlePDF}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition-all"
                    title="Export to PDF"
                  >
                    <FaFilePdf className="text-lg xl:text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto min-h-[350px]"
            style={{ scrollbarWidth: "none" }}
          >
            <table className="w-full text-[17px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-6 py-3 text-center hidden sm:table-cell font-semibold text-gray-700">
                    SL.NO
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    User Name
                  </th>
                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    Enrollment ID
                  </th>
                  <th className="px-6 py-3 text-center hidden md:table-cell font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center hidden lg:table-cell font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">👤</div>
                        <p className="text-gray-500 text-base font-medium">
                          No user data
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200 even:bg-blue-50/60"
                    >
                      <td className="px-6 py-2 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>
                      <td className="px-6 py-2 text-center font-medium">
                        {user.userName || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden md:table-cell">
                        {user.empname || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden lg:table-cell">
                        {user.enrollmentId || "-"}
                      </td>
                      <td className="px-6 py-2 text-center hidden md:table-cell">
                        {user.role || "-"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm lg:text-base 3xl:text-lg font-semibold border ${user.active ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                          >
                            {user.active ? "✓ Active" : "○ Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setFormData(user);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                            title="View"
                          >
                            <FaEye className="text-lg lg:text-xl 3xl:text-2xl" />
                          </button>
                          <button
                            onClick={() => {
                              setFormData(user);
                              setEditId(user.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:text-green-700 hover:bg-green-100 p-1.5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FaPen className="text-lg lg:text-xl 3xl:text-2xl" />
                          </button>
                          <button
                            onClick={() =>
                              setUsers(users.filter((v) => v.id !== user.id))
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <MdDeleteForever className="text-xl lg:text-xl 3xl:text-2xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-sm xl:text-base text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredUsers.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredUsers.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredUsers.length}
              </span>{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="First page"
              >
                First
              </button>

              <button
                disabled={currentPage == 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Previous page"
              >
                <GrPrevious />
              </button>

              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-semibold min-w-[45px] text-center">
                {currentPage}
              </div>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 p-2 rounded-lg transition-all"
                title="Next page"
              >
                <GrNext />
              </button>

              <button
                disabled={currentPage == totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="Last page"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {openModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Tabs Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <div className="flex gap-6">
                  {["details", "roles", "menu"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 font-semibold lg:text-lg 3xl:text-2xl transition-all ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                    >
                      {tab.charAt(0).toUpperCase() +
                        tab
                          .slice(1)
                          .replace("details", "User Details")
                          .replace("roles", "User Roles")
                          .replace("menu", "User Menu")}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              {activeTab === "details" && (
                <div className="mb-8 animate-in fade-in duration-300">
                  <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900 mb-6">
                    {mode === "view"
                      ? "View User"
                      : mode === "edit"
                        ? "Edit User"
                        : "Add New User"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className={labelStyle}>
                        User Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="Enter user name"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>
                        Employee Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="empname"
                        value={formData.empname}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="Enter employee name"
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>
                        Enrollment ID / Email
                      </label>
                      <input
                        name="enrollmentId"
                        value={formData.enrollmentId}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="ID or Email"
                      />
                    </div>
                    <SearchDropdown
                      label={
                        <>
                          Company <span className="text-red-500">*</span>
                        </>
                      }
                      name="company"
                      value={formData.company}
                      displayValue={formData.company_name}
                      options={companyOptions}
                      labelKey="name"
                      valueKey="id"
                      labelName="company_name"
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle={inputStyle}
                      labelStyle={labelStyle}
                    />
                    <div>
                      <label className={labelStyle}>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className={inputStyle}
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="flex items-center gap-3 h-fit sm:mt-8">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        disabled={mode === "view"}
                        className="w-5 h-5 cursor-pointer accent-blue-500"
                      />
                      <label className={`pt-1.5 ${labelStyle}`}>Active</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "roles" && (
                <div className="mb-8 animate-in fade-in duration-300">
                  <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900 mb-6">
                    User Roles
                  </h2>
                  <div className="max-w-md">
                    <SearchDropdown
                      label={
                        <>
                          User Role <span className="text-red-500">*</span>
                        </>
                      }
                      name="role"
                      value={formData.role}
                      options={[
                        "admin",
                        "employee",
                        "hr",
                        "manager",
                        "timekeeper",
                        "approver",
                      ]}
                      formData={formData}
                      setFormData={setFormData}
                      disabled={mode === "view"}
                      inputStyle="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl lg:text-lg 3xl:text-xl focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm"
                      labelStyle={labelStyle}
                    />
                  </div>
                </div>
              )}

              {activeTab === "menu" && (
                <div className="mb-8 animate-in fade-in duration-300">
                  <h2 className="text-xl lg:text-2xl 3xl:text-4xl font-bold text-gray-900 mb-6">
                    User Menu Access
                  </h2>
                  <div className="border border-blue-100/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 lg:text-lg 3xl:text-2xl">
                      Select Menu to give Access to the Current User
                    </div>
                    <div
                      className="overflow-x-auto max-h-[500px]"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <table className="w-full text-sm lg:text-base 3xl:text-xl border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-blue-100/50">
                            <th className="px-4 py-3">
                              <input
                                type="checkbox"
                                disabled={mode === "view"}
                                onChange={(e) =>
                                  setMenuData(
                                    menuData.map((m) => ({
                                      ...m,
                                      isSelected: e.target.checked,
                                    })),
                                  )
                                }
                              />
                            </th>
                            <th className="px-4 py-3 text-left hidden md:table-cell font-semibold text-gray-700">
                              Parent ID
                            </th>
                            <th className="px-4 py-3 text-left hidden sm:table-cell font-semibold text-gray-700">
                              Menu ID
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Menu Name
                            </th>
                            <th className="px-4 py-3 text-left hidden lg:table-cell font-semibold text-gray-700">
                              URL
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Selected
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuData.map((menu, index) => (
                            <tr
                              key={index}
                              className="border-b border-blue-100/30 bg-white hover:bg-blue-50 transition-all"
                            >
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={menu.isSelected}
                                  disabled={mode === "view"}
                                  onChange={() => handleCheckbox(menu.menuID)}
                                  className="w-4 h-4 accent-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center hidden md:table-cell text-gray-700">
                                {menu.parentMenuID}
                              </td>
                              <td className="px-4 py-2 text-center hidden sm:table-cell text-gray-700">
                                {menu.menuID}
                              </td>
                              <td className="px-4 py-2 text-gray-900 font-medium">
                                {menu.menuName}
                              </td>
                              <td className="px-4 py-2 text-gray-600 hidden lg:table-cell text-sm">
                                {menu.url}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${menu.isSelected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                                >
                                  {menu.isSelected ? "True" : "False"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {mode !== "view" && (
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-blue-100/30">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:text-gray-900 xl:text-base font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg xl:text-base hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
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
