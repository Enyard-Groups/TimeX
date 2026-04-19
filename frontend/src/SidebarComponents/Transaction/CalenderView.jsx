import React, { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SearchDropdown from "../SearchDropdown";
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const CalenderView = () => {
  const [openCalenderGrid, setOpenCalenderGrid] = useState(false);
  const [shifts, setShifts] = useState({});

  const [showstartSpinner, setshowstartSpinner] = useState(false);
  const [showendSpinner, setshowendSpinner] = useState(false);
  const [formData, setFormData] = useState({
    startdate: "",
    enddate: "",
    location: "",
    location_id: "",
    employee: "",
    employee_id: "",
  });

  const [locationOptions, setLocationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [shiftMasters, setShiftMasters] = useState([]);

   const inputStyle =
    "w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 xl:text-base rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const labelStyle =
    "text-sm xl:text-base focus:outline-none font-semibold text-slate-600 mb-1.5 block";


  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    try {
      const [locRes, empRes, shiftRes] = await Promise.all([
        axios.get(`${API_BASE}/master/geofencing`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/employee`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/master/shifts`, { headers: getHeaders() }),
      ]);
      setLocationOptions(locRes.data || []);
      setEmployeeOptions(empRes.data || []);
      setShiftMasters(shiftRes.data || []);
    } catch (error) {
      console.error("Failed to fetch Master data:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleShiftChange = (date, value) => {
    const key = date.toLocaleDateString("en-GB");

    setShifts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlecalendergrid = () => {
    const { startdate, enddate, location_id, employee_id } = formData;

    if (!startdate || !enddate || !location_id || !employee_id) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    // convert dd/mm/yyyy → Date
    const [sd, sm, sy] = startdate.split("/");
    const [ed, em, ey] = enddate.split("/");

    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

    // Fetch existing roster
    const fetchExistingRoster = async () => {
      try {
        const res = await axios.get(`${API_BASE}/shift-planner`, {
          params: {
            employee_id: employee_id,
            start_date: `${sy}-${sm.padStart(2, "0")}-${sd.padStart(2, "0")}`,
            end_date: `${ey}-${em.padStart(2, "0")}-${ed.padStart(2, "0")}`,
          },
          headers: getHeaders(),
        });
        const existing = {};
        res.data.forEach((r) => {
          const date = new Date(r.roster_date);
          const key = date.toLocaleDateString("en-GB");
          existing[key] = r.shift_id || "Off";
        });
        setShifts(existing);
      } catch (error) {
        console.error("Failed to fetch existing roster:", error);
      }
    };

    fetchExistingRoster();
    setOpenCalenderGrid(!openCalenderGrid);
  };

  const getDatesBetween = (start, end) => {
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const [d, m, y] = dateStr.split("/");
    return new Date(y, m - 1, d);
  };

  const startDateObj = parseDate(formData.startdate);
  const endDateObj = parseDate(formData.enddate);

  const dateRange =
    startDateObj && endDateObj ? getDatesBetween(startDateObj, endDateObj) : [];

  // find first day index (0 = Sun, 1 = Mon...)
  const startDayIndex = startDateObj ? startDateObj.getDay() : 0;

  const handleAssign = async () => {
    const totalDates = dateRange.length;
    const selectedShifts = Object.values(shifts).filter((shift) => shift !== "");

    if (selectedShifts.length !== totalDates) {
      toast.error("Please select shift for all dates");
      return;
    }

    try {
      const payload = {
        employee_id: formData.employee_id,
        location_id: formData.location_id,
        roster: shifts, // Backend expects { "dd/mm/yyyy": shift_id }
      };

      await axios.post(`${API_BASE}/shift-planner/assign`, payload, {
        headers: getHeaders(),
      });

      toast.success("Roster Assigned Successfully");

      setFormData({
        startdate: "",
        enddate: "",
        location: "",
        location_id: "",
        employee: "",
        employee_id: "",
      });

      setShifts({});
      setOpenCalenderGrid(false);
    } catch (error) {
      console.error("Failed to assign roster:", error);
      toast.error(error.response?.data?.message || "Failed to assign roster");
    }
  };

  const handleDownload = () => {
    const totalDates = dateRange.length;

    const selectedShifts = Object.values(shifts).filter(
      (shift) => shift !== "",
    );

    if (selectedShifts.length !== totalDates) {
      toast.error("Please select shift for all dates");
      return;
    }

    const excelData = dateRange.map((date) => {
      const key = date.toLocaleDateString("en-GB");

      return {
        Employee: formData.employee,
        Location: formData.location,
        Date: key,
        Shift: shifts[key] || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Shift");
    XLSX.writeFile(workbook, "ShiftData.xlsx");

    toast.success("Download Successful");
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl mb-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Start Date */}
          <div>
            <label className={labelStyle}>
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              name="startdate"
              value={formData.startdate}
              onChange={handleChange}
              onClick={() => {
                setshowstartSpinner(true);
                setshowendSpinner(false);
              }}
              placeholder="dd/mm/yyyy"
              className={inputStyle}
            />

            {showstartSpinner && (
              <SpinnerDatePicker
                value={formData.startdate}
                onChange={(date) =>
                  setFormData({ ...formData, startdate: date })
                }
                onClose={() => setshowstartSpinner(false)}
              />
            )}
          </div>

          {/* End Date */}
          <div>
            <label className={labelStyle}>
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              name="enddate"
              value={formData.enddate}
              onChange={handleChange}
              onClick={() => {
                setshowendSpinner(true);
                setshowstartSpinner(false);
              }}
              placeholder={
                !formData.startdate ? "Select Start Date" : "dd/mm/yyyy"
              }
              className={inputStyle}
              disabled={!formData.startdate}
            />

            {showendSpinner && (
              <SpinnerDatePicker
                value={formData.enddate}
                onChange={(date) => setFormData({ ...formData, enddate: date })}
                onClose={() => setshowendSpinner(false)}
              />
            )}
          </div>

          {/* Location */}
          <div>
            <SearchDropdown
              label={
                <>
                  Location <span className="text-red-500">*</span>
                </>
              }
              name="location_id"
              value={formData.location_id}
              displayValue={formData.location}
              options={locationOptions}
              labelKey="name"
              valueKey="id"
              labelName="location"
              formData={formData}
              setFormData={setFormData}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
            />
          </div>

          {/* Employee */}
          <div>
            <SearchDropdown
              label={
                <>
                  Employee <span className="text-red-500">*</span>
                </>
              }
              name="employee_id"
              value={formData.employee_id}
              displayValue={formData.employee}
              options={employeeOptions.map((e) => ({
                id: e.id,
                name: `${e.full_name} (${e.company_enrollment_id})`,
              }))}
              labelKey="name"
              valueKey="id"
              labelName="employee"
              formData={formData}
              setFormData={setFormData}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
            />
          </div>

          {/* Button */}
          <div className="flex items-end">
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
              onClick={handlecalendergrid}
            >
              Show Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {openCalenderGrid && (
        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-blue-100/50">
          {/* Download */}

          <div className="flex justify-end mb-6">
            <button
              className="bg-blue-50 border border-blue-200 px-4 py-2 xl:text-base rounded-lg hover:bg-blue-100"
              onClick={handleDownload}
            >
              Download Shift Planner
            </button>
          </div>

          <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <div className="min-w-[700px]">
              {/* Week Header */}
              <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm xl:text-base font-semibold text-gray-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-4 ">
                {Array.from({ length: startDayIndex }).map((_, i) => (
                  <div key={"empty-" + i}></div>
                ))}

                {dateRange.map((date, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-blue-100 bg-white shadow-sm hover:shadow-md transition mb-1"
                  >
                    <p className="text-sm xl:text-base mb-2 font-semibold text-blue-600">
                      {date.toLocaleDateString("en-GB")}
                    </p>

                    <select
                      className="w-full text-sm xl:text-base bg-blue-50 border border-blue-200 rounded-md px-2 py-1"
                      value={shifts[date.toLocaleDateString("en-GB")] || ""}
                      onChange={(e) => handleShiftChange(date, e.target.value)}
                    >
                      <option value="">Select Shift</option>
                      {shiftMasters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.shift_name}
                        </option>
                      ))}
                      <option value="Off">Weekly Off</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assign */}
          <div className="flex justify-center mt-8">
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition"
              onClick={handleAssign}
            >
              Assign This Roster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalenderView;
