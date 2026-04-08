import React, { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import SpinnerDatePicker from "../SpinnerDatePicker";
import SearchDropdown from "../SearchDropdown";

const CalenderView = () => {
  const [openCalenderGrid, setOpenCalenderGrid] = useState(false);
  const [shifts, setShifts] = useState({});

  const [showstartSpinner, setshowstartSpinner] = useState(false);
  const [showendSpinner, setshowendSpinner] = useState(false);
  const [formData, setFormData] = useState({
    startdate: "",
    enddate: "",
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

    // convert dd/mm/yyyy → Date
    const [sd, sm, sy] = startdate.split("/");
    const [ed, em, ey] = enddate.split("/");

    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

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
      startdate: "",
      enddate: "",
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
          <input
            name="startdate"
            value={formData.startdate}
            onChange={handleChange}
            onClick={() => {
              (setshowstartSpinner(true), setshowendSpinner(false));
            }}
            placeholder="dd/mm/yyyy"
            className={inputStyle}
          />

          {showstartSpinner && (
            <SpinnerDatePicker
              value={formData.startdate}
              onChange={(date) => setFormData({ ...formData, startdate: date })}
              onClose={() => setshowstartSpinner(false)}
            />
          )}
        </div>

        <div>
          <label className={labelStyle}>
            End Date
            <span className="text-[oklch(0.577_0.245_27.325)]"> * </span>
          </label>
          <input
            name="enddate"
            value={formData.enddate}
            onChange={handleChange}
            onClick={() => {
              (setshowendSpinner(true), setshowstartSpinner(false));
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

        <div>
          <SearchDropdown
            label={
              <>
                Location <span className="text-red-500">*</span>
              </>
            }
            name="location"
            value={formData.location}
            options={["Head Office"]}
            formData={formData}
            setFormData={setFormData}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />
        </div>

        <div>
          <SearchDropdown
            label={
              <>
                Employee <span className="text-red-500">*</span>
              </>
            }
            name="employee"
            value={formData.employee}
            options={[
              "Employee 1",
              "Employee 2",
              "Employee 3",
              "Employee 4",
              "Employee 5",
            ]}
            formData={formData}
            setFormData={setFormData}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />
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
        <div
          className="mt-6 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
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
