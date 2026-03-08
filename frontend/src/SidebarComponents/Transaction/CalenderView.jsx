import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const CalenderView = () => {
  const [openCalenderGrid, setOpenCalenderGrid] = useState(false);
  const [shifts, setShifts] = useState({});
  const [formData, setFormData] = useState({
    startdate: null,
    enddate: null,
    location: "",
    employee: "",
  });

  const handleShiftChange = (date, value) => {
    const key = date.toLocaleDateString("en-GB");

    setShifts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)]";

  const labelStyle =
    "text-lg font-medium text-[oklch(0.147_0.004_49.25)] mb-1 block";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlecalendergrid = () => {
    const { startdate, enddate, location, employee } = formData;

    if (!startdate || !enddate || !location || !employee) {
      toast.error("Please fill all required fields");
      return; // stop execution
    }

    setOpenCalenderGrid(!openCalenderGrid);
  };

  const getDatesBetween = (start, end) => {
    const dates = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const dateRange =
    formData.startdate && formData.enddate
      ? getDatesBetween(formData.startdate, formData.enddate)
      : [];

  // find first day index (0 = Sun, 1 = Mon...)
  const startDayIndex = formData.startdate
    ? new Date(formData.startdate).getDay()
    : 0;

  const handleAssign = () => {
    const totalDates = dateRange.length;

    const selectedShifts = Object.values(shifts).filter(
      (shift) => shift !== "",
    );

    if (selectedShifts.length !== totalDates) {
      toast.error("Please select shift for all dates");
      return;
    }

    toast.success("Roster Assigned Successfully");

    console.log({
      employee: formData.employee,
      location: formData.location,
      roster: shifts,
    });

    setFormData({
      startdate: null,
      enddate: null,
      location: "",
      employee: "",
    });

    setOpenCalenderGrid(false);
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
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className={labelStyle}>
            StartDate
            <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
          </label>
          <DatePicker
            placeholderText="dd/mm/yyyy"
            selected={formData.startdate}
            onChange={(date) => setFormData({ ...formData, startdate: date })}
            className={inputStyle}
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            scrollableYearDropdown
            minDate={new Date(1950, 0, 1)}
            maxDate={new Date(new Date().getFullYear() + 15, 11, 31)}
          />
        </div>

        <div>
          <label className={labelStyle}>
            End Date
            <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
          </label>

          <DatePicker
            placeholderText={
              !formData.startdate ? "Select Start Date" : "dd/mm/yyyy"
            }
            selected={formData.enddate}
            onChange={(date) => setFormData({ ...formData, enddate: date })}
            className={inputStyle}
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            scrollableYearDropdown
            minDate={formData.startdate}
            maxDate={new Date(new Date().getFullYear() + 15, 11, 31)}
            disabled={!formData.startdate}
          />
        </div>

        <div>
          <label className={labelStyle}>
            Location
            <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={inputStyle}
            required
          >
            <option>Select</option>
            <option> Head Office</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>
            Employee
            <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
          </label>
          <select
            name="employee"
            value={formData.employee}
            onChange={handleChange}
            className={inputStyle}
            required
          >
            <option>Select</option>
            <option> 000971001 </option>
            <option> 000971004 </option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            className="px-4 py-2 rounded-lg text-white bg-[oklch(0.645_0.246_16.439)] hover:opacity-90"
            onClick={handlecalendergrid}
          >
            Show Calendar
          </button>
        </div>
      </div>

      {openCalenderGrid && (
        <div className="mt-6 overflow-x-auto">
          <div className="m-10 flex justify-center items-center">
            <button
              className="px-6 py-2 rounded-lg bg-[oklch(0.87_0.001_106.424)]"
              onClick={handleDownload}
            >
              Download Shift Planner
            </button>
          </div>

          <div className="min-w-[1100px]">
            {/* Week Header */}
            <div className="grid grid-cols-7 gap-4 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center w-[150px] font-medium text-[oklch(0.45_0.004_49.25)]"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4">
              {/* Empty cells */}
              {Array.from({ length: startDayIndex }).map((_, i) => (
                <div key={"empty-" + i} className="w-[150px]"></div>
              ))}

              {/* Dates */}
              {dateRange.map((date, index) => (
                <div
                  key={index}
                  className="p-3 mb-4 shadow-md rounded-lg w-[150px]"
                >
                  <p className="text-sm mb-4 font-medium text-[oklch(0.555_0.246_16.439)] ">
                    {date.toLocaleDateString("en-GB")}
                  </p>

                  <select
                    className="w-full text-sm border rounded-md px-2 py-1 border-[oklch(0.923_0.003_48.717)]"
                    value={shifts[date.toLocaleDateString("en-GB")] || ""}
                    onChange={(e) => handleShiftChange(date, e.target.value)}
                  >
                    <option value="">Select Shift</option>
                    <option>General Shift</option>
                    <option>Night Shift</option>
                    <option>RS</option>
                    <option>AL</option>
                    <option>Off</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center my-8">
            <button
              className="px-6 py-2 rounded-lg text-white bg-[oklch(0.645_0.246_16.439)]"
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
