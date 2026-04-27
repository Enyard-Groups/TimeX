import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaAngleRight,
  FaEye,
  FaPen,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { MdDeleteForever } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoCopy } from "react-icons/go";
import { GrPrevious, GrNext } from "react-icons/gr";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Helper component to physically move the map when coordinates change
 */
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center.lat && center.lng) {
      map.setView([center.lat, center.lng], 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

/**
 * Component to handle manual clicks on the map to set coordinates
 */
const MapClickHandler = ({ setMarkerPosition, setFormData, disabled }) => {
  useMapEvents({
    click(e) {
      if (disabled) return;
      const { lat, lng } = e.latlng;
      setMarkerPosition({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    },
  });
  return null;
};

const GeofencingMaster = () => {
  const API_BASE = "http://localhost:3000/api";

  const [mode, setMode] = useState(""); // "view" | "edit"
  const [openModal, setOpenModal] = useState(false);
  const [location, setLocation] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: 28.4595,
    lng: 77.0266,
  });

  const [markerPosition, setMarkerPosition] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    longitude: "",
    latitude: "",
    searchradius: "",
  });

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

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/master/geofencing`, {
        headers: getHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setLocation(
        data.map((d) => ({
          id: d.id,
          name: d.name || "",
          latitude: d.latitude || "",
          longitude: d.longitude || "",
          searchradius: d.radius || "",
        })),
      );
    } catch (error) {
      console.error("Failed to fetch geofencing locations", error);
      toast.error("Unable to load geofencing locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);


  const filteredlocation = location.filter((x) =>
    x.name.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  const endIndex = currentPage * entriesPerPage;

  const startIndex = endIndex - entriesPerPage;

  const currentlocation = filteredlocation.slice(startIndex, endIndex);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredlocation.length / entriesPerPage),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearchLocation = async () => {
    if (!formData.name) {
      toast.error("Enter location name");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${formData.name}`,
      );

      const data = await res.json();

      if (!data.length) {
        toast.error("Location not found");
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });

      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));

      toast.success("Location found");
    } catch {
      toast.error("Search failed");
    }
  };

  const handleSubmit = async () => {
    const { name, longitude, latitude, searchradius } = formData;

    if (!name || !longitude || !latitude) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      name,
      latitude,
      longitude,
      search_radius: searchradius,
    };

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE}/master/geofencing/${editId}`,
          payload,
          { headers: getHeaders() },
        );

        const updated = {
          id: res.data.id,
          name: res.data.name || "",
          latitude: res.data.latitude || "",
          longitude: res.data.longitude || "",
          searchradius: res.data.search_radius || "",
        };

        setLocation((prev) =>
          prev.map((item) => (item.id === editId ? updated : item)),
        );

        toast.success("Data updated");
      } else {
        const res = await axios.post(`${API_BASE}/master/geofencing`, payload, {
          headers: getHeaders(),
        });

        const created = {
          id: res.data.id,
          name: res.data.name || "",
          latitude: res.data.latitude || "",
          longitude: res.data.longitude || "",
          searchradius: res.data.search_radius || "",
        };

        setLocation((prev) => [created, ...prev]);
        toast.success("Data Added");
      }

      setOpenModal(false);
      setEditId(null);

      setFormData({
        name: "",
        latitude: "",
        longitude: "",
        searchradius: "",
      });
      setMarkerPosition(null);
    } catch (error) {
      console.error("Failed to save geofencing location", error);
      toast.error(
        error.response?.data?.message || "Unable to save geofencing location",
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/master/geofencing/${id}`, {
        headers: getHeaders(),
      });
      setLocation((prev) => prev.filter((v) => v.id !== id));
      toast.success("Location deleted");
    } catch (error) {
      console.error("Failed to delete geofencing location", error);
      toast.error(
        error.response?.data?.message || "Unable to delete geofencing location",
      );
    }
  };

  const handleCopy = () => {
    const header = ["SL.NO", "Location Name", "Latitude", "Longitude"].join(
      "\t",
    );

    const rows = filteredlocation
      .map((item, index) =>
        [index + 1, item.name, item.latitude, item.longitude].join("\t"),
      )
      .join("\n");

    const text = `${header}\n${rows}`;

    navigator.clipboard.writeText(text);
    toast.success("Table copied to clipboard");
  };

  const handleExcel = () => {
    const excelData = filteredlocation.map((item, index) => ({
      "SL.NO": index + 1,
      "Location Name": item.name,
      Latitude: item.latitude,
      Longitude: item.longitude,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Geofencing");

    XLSX.writeFile(workbook, "GeofencingData.xlsx");
  };

  const handlePDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["SL.NO", "Location Name", "Latitude", "Longitude"];

    const tableRows = [];

    filteredlocation.forEach((item, index) => {
      const row = [index + 1, item.name, item.latitude, item.longitude];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("GeofencingData.pdf");
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4 pl-10 lg:pl-0">
          <h1 className="flex items-center gap-2 h-[30px] text-lg xl:text-xl font-semibold text-gray-800">
            <FaAngleRight className="text-blue-500 text-base" />
            <span className="text-gray-500">Geofencing</span>
            <FaAngleRight className="text-blue-500 text-base" />
            <div
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-blue-600 hover:text-blue-700 transition"
            >
              Geofencing Master
            </div>
          </h1>

          {!openModal && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setMode("");
                  setEditId(null);
                  setFormData({
                    name: "",
                    latitude: "",
                    longitude: "",
                    searchradius: "",
                  });
                  setOpenModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white xl:text-lg font-semibold px-6 py-2 rounded-lg border border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                + Add New
              </button>
            </div>
          )}
        </div>

        {/* Container */}
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
                  className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/60"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm xl:text-base text-gray-600">
                  entries
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <input
                  placeholder="Search location..."
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
            <table className="w-full text-[17px] text-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-blue-100/50">
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                    SL.NO
                  </th>
                  <th className="px-6 text-center font-semibold text-gray-700 py-3">
                    Location Name
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                    Latitude
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                    Longitude
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentlocation.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl opacity-40">📍</div>
                        <p className="text-gray-500 text-base font-medium">
                          No Geofencing Location
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentlocation.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100/30 bg-white/50 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {item.latitude}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {item.longitude}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setFormData(item);
                              setMode("view");
                              setOpenModal(true);
                            }}
                            className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg"
                          >
                            <FaEye />
                          </button>

                          <button
                            onClick={() => {
                              setFormData(item);
                              setEditId(item.id);
                              setMode("edit");
                              setOpenModal(true);
                            }}
                            className="text-green-500 hover:bg-green-100 p-1.5 rounded-lg"
                          >
                            <FaPen />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg"
                          >
                            <MdDeleteForever />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="p-6 border-t border-blue-100/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-sm xl:text-base text-gray-600">
              Showing{" "}
              <span className="text-gray-900 font-semibold">
                {filteredlocation.length === 0 ? "0" : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, filteredlocation.length)}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 font-semibold">
                {filteredlocation.length}
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

        {openModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-blue-100/50 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto p-8"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-100/30">
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === "view"
                    ? "View Geofencing Location"
                    : mode === "edit"
                      ? "Edit Geofencing Location"
                      : "Add New Geofencing Location"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <RxCross2 className="text-2xl" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end mb-4">
                <div>
                  <label className={labelStyle}>
                    Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="0.0000"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="0.0000"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Location Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    placeholder="Office Branch"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelStyle}>
                    Radius (Meters) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="Number"
                      name="searchradius"
                      value={formData.searchradius}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      placeholder="e.g. 100"
                      className={inputStyle}
                    />
                    <button
                      disabled={mode === "view"}
                      onClick={handleSearchLocation}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                {mode !== "view" && (
                  <div className="flex justify-center items-center">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>

              {/* MAP AREA */}
              <div className="h-[500px] w-full rounded-2xl border-4 border-slate-50 overflow-hidden shadow-inner relative z-0">
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <RecenterMap center={mapCenter} />
                  <MapClickHandler
                    setMarkerPosition={setMarkerPosition}
                    setFormData={setFormData}
                    disabled={mode === "view"}
                  />

                  {markerPosition && (
                    <Marker
                      position={[markerPosition.lat, markerPosition.lng]}
                    />
                  )}

                  {markerPosition && formData.searchradius && (
                    <Circle
                      center={[markerPosition.lat, markerPosition.lng]}
                      radius={Number(formData.searchradius)}
                      pathOptions={{
                        color: "#3b82f6",
                        fillColor: "#3b82f6",
                        fillOpacity: 0.2,
                      }}
                    />
                  )}
                </MapContainer>
                {mode !== "view" && (
                  <div className="absolute bottom-4 left-4 z-[400] bg-white/90 px-3 py-1 rounded text-[10px] font-bold text-blue-600 shadow-sm border border-blue-100 uppercase">
                    Click map to pin location
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GeofencingMaster;
