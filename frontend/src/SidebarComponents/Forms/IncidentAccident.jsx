/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
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
import SpinnerTimePicker from "../SpinnerTimePicker";
import SpinnerDatePicker from "../SpinnerDatePicker";

const IncidentAccident = () => {
  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [incidentData, setIncidentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [showDateSpinner, setShowDateSpinner] = useState(false);
  const [showTimeSpinner, setShowTimeSpinner] = useState(false);

  const inputStyle =
    "text-lg w-full  border  border-[oklch(0.923_0.003_48.717)] bg-white px-2 py-1 rounded-md text-[oklch(0.147_0.004_49.25)] placeholder-[oklch(0.37_0.001_106.424)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] ";

  const labelStyle = "text-md text-[oklch(0.147_0.004_49.25)] my-1 block";

  const defaultFormData = {
    dateOfIncident: null,
    timeOfIncident: null,
    location: "",
    building: "",
    otherdetails: "",
    typeofincident: "",
    personAffected: "",
    specifyOtherDetails: "",
    incidentTimeline: "",
    actionTaken: "",
    injuryDetails: {
      illness: "",
      nameofperson: "",
      age: "",
      gender: "",
      category: "",
      description: "",
      firstaid: "",
      takentohospital: "",
      firstAiderName: "",
      firstAiderDesignation: "",
      firstAiderDetail: "",
    },
    msoOcc: {
      time: null,
      date: null,
      msoName: "",
      occStaffName: "",
    },
    signature: {
      reportedBy: "",
      reporterDesignation: "",
      filledBy: "",
      fillerDesignation: "",
      dateOfFillingForm: null,
    },
    reportAcknowledge: {
      assitantName: "",
      dateTime: null,
      uploadSign: null,
    },
  };

  const [formData, setFormData] = useState(defaultFormData);
  return (
    <div className="mb-16">
      <div>
        <h1 className="text-red-500 text-xl text-center">
          Incident/Accident Report{" "}
        </h1>

        {/* Incident Details  */}
        <div>
          <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg rounded">
            Incident Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
            <div className="flex flex-row gap-2">
              <label className={`${labelStyle}  w-1/3`}>
                Date of Incident:{" "}
              </label>
              <input type="text" className={inputStyle} />
            </div>

            <div className="flex flex-row gap-2">
              <label className={`${labelStyle}  w-1/3`}>
                Time of Incident:{" "}
              </label>
              <input type="text" className={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
            <div className="flex flex-row gap-2">
              <label className={`${labelStyle} w-1/3`}>Location: </label>
              <input type="text" className={inputStyle} />
            </div>

            <div className="flex flex-row gap-2">
              <label className={`${labelStyle} w-1/3`}>Building/Room: </label>
              <input type="text" className={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
            <div className="flex flex-row gap-2">
              <label className={`${labelStyle}  w-1/3`}>Other Details: </label>
              <input type="text" className={inputStyle} />
            </div>
            <div className="flex flex-row gap-2">
              <label className={`${labelStyle}  w-1/3`}>
                Type of the incident:{" "}
              </label>
              <input type="text" className={inputStyle} />
            </div>
          </div>
          <h1 className="mt-2">
            (Assult, Verbal Abuse, Security Threat,Fire, Theft, Robbery, Fraud,
            injury, Illness, damage, etc)
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
            <div className="flex flex-row gap-2">
              <label className={`${labelStyle}  w-1/3`}>
                Person Affected:{" "}
              </label>
              <input type="text" className={inputStyle} />
            </div>
            <div className="flex flex-row gap-2">
              <label className={`${labelStyle}  w-1/3`}>
                Others (Please Specify):{" "}
              </label>
              <input type="text" className={inputStyle} />
            </div>
          </div>
        </div>

        {/* Incident Timeline */}
        <div>
          <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
            Incident Timeline{" "}
          </h1>
          <p>
            * ((Record the details of the incident /accident in the below
            section as per the timeline of occurence of events))
          </p>
          <textarea className="w-full border border-gray-400 h-[300px] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] p-2 rounded" />
        </div>

        {/* Action Taken */}
        <div>
          <h1 className="bg-gray-200 py-1 px-3 border border-gray-400 text-lg mt-4 rounded">
            Action Taken At Incident Scene (Details){" "}
          </h1>
          <textarea className="w-full mt-2 border border-gray-400 h-[200px] focus:outline-none focus:ring-2 focus:ring-[oklch(0.645_0.246_16.439)] p-2 rounded" />
        </div>

        {/* Injury Details */}
        <div className="border border-gray-400 rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Injury Details</h2>

          {/* Yes / No */}
          <div className="flex items-center gap-4 mb-3">
            <span>
              Was anyone injured or ill due to or as part of the incident?
            </span>
            <label>
              <input type="checkbox" /> YES
            </label>
            <label>
              <input type="checkbox" /> NO
            </label>
          </div>

          {/* Table Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div>
              <label className={labelStyle}>Name of injured/ ill Person</label>
              <input className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Age</label>
              <input className={inputStyle} />
            </div>

            <div>
              <h1 className={labelStyle}>Gender</h1>
              <div className="flex items-center gap-2">
                <label>
                  <input type="radio" name="gender" /> M
                </label>
                <label>
                  <input type="radio" name="gender" /> F
                </label>
              </div>
            </div>

            <div>
              <h1 className={labelStyle}>Was First Aid Provided?</h1>
              <div className="space-x-2">
                <label>
                  <input type="radio" name="firstaid" /> Yes
                </label>
                <label>
                  <input type="radio" name="firstaid" /> No
                </label>
              </div>
            </div>

            <div>
              <h1 className={labelStyle}>Taken to Hospital</h1>

              <div className="space-x-2">
                <label>
                  <input type="radio" name="takentohospital" /> Yes
                </label>
                <label>
                  <input type="radio" name="takentohospital" /> No
                </label>
              </div>
            </div>

            <div>
              <label className={labelStyle}>
                Category ( Contractor, third party, public, staff, student etc)
              </label>
              <input className={inputStyle} />
            </div>

            <div className="col-span-2">
              <label className={`${labelStyle} text-center`}>
                Description of Injury/ Illness
              </label>
              <textarea className={`${inputStyle}col-span-2`} />
            </div>
          </div>

          <h2 className="font-semibold mb-2">First Aid Details</h2>

          <div className="md:w-3/4">
            <div className="flex flex-row mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}>
                Name of First Aider :
              </label>
              <input className={inputStyle} />
            </div>
            <div className="flex flex-row mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2  w-1/2`}>
                Designation :
              </label>
              <input className={inputStyle} />
            </div>
            <div className="flex flex-row mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2  w-1/2`}>
                Details of First Aid Provided :
              </label>
              <input className={inputStyle} />
            </div>
          </div>
        </div>

        {/* Reporting Section */}
        <div className="border border-gray-400 rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Reporting to MSO & Safecor OCC</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className=" mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}>
                Time
              </label>
              <input type="time" className={inputStyle} />
            </div>

            <div className=" mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}>
                Date
              </label>
              <input type="date" className={inputStyle} />
            </div>

            <div className=" mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}>
                Reported to MSO Name
              </label>
              <input className={inputStyle} />
            </div>

            <div className=" mt-2">
              <label className={`${labelStyle} whitespace-nowrap mr-2 w-1/2`}>
                Safecor OCC Staff Name
              </label>
              <input className={inputStyle} />
            </div>
          </div>
        </div>

        {/* Acknowledgement */}
        <div className="border border-gray-400 rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Signature</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelStyle}>Incident Reported By</label>
              <input className={inputStyle} />
            </div>
            <input
              placeholder="Designation"
              className="border border-gray-400 p-2"
            />
            <input
              placeholder="Form Filled By"
              className="border border-gray-400 p-2"
            />
            <input
              placeholder="Designation"
              className="border border-gray-400 p-2"
            />
            <input
              type="date"
              className="border border-gray-400 p-2 col-span-2"
            />
          </div>

          <h2 className="font-semibold mb-2">Report Acknowledged By</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="MSO Name"
              className="border border-gray-400 p-2"
            />
            <input type="file" className="border border-gray-400 p-2" />
            <input type="date" className="border border-gray-400 p-2" />
            <div className="border h-24 flex items-center justify-center">
              Sign Here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentAccident;
