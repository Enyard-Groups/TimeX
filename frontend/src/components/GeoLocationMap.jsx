/* eslint-disable react-hooks/set-state-in-effect */
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const GeoLocationMap = () => {
  const [geoData, setGeoData] = useState([]);
  useEffect(() => {
    const data = [
      { name: "Mumbai", lat: 19.076, lng: 72.8777, value: 120 },
      { name: "Delhi", lat: 28.7041, lng: 77.1025, value: 95 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946, value: 75 },
      { name: "Hyderabad", lat: 17.385, lng: 78.4867, value: 60 },
    ];
    setGeoData(data);
  }, []);
  return (
    <div
      className="
       h-[450px]
          col-span-2
  bg-white/50
  backdrop-blur-xl
  border border-white/60
  rounded-3xl
  p-6
  shadow-[0_10px_40px_rgba(0,0,0,0.06)]
"
    >
      <h2
        className="text-md text-center font-semibold mb-4"
        style={{ color: "oklch(0.5 0.004 49.25)" }}
      >
        Geographical Attendance Distribution
      </h2>

      <div
        className="
    w-full h-[350px] rounded-3xl overflow-hidden shadow-lg"
      >
        <MapContainer
          center={[20.5937, 78.9629]} // Default India center
          zoom={5}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution=""
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geoData.map((location, index) => (
            <CircleMarker
              key={index}
              center={[location.lat, location.lng]}
              radius={1 + location.value / 10}
              pathOptions={{
                color: "oklch(0.62 0.246 16.439)",
                fillColor: "oklch(0.82 0.245 27.325)",
                fillOpacity: 0.7,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-sm">
                  <strong>{location.name}</strong>
                  <br />
                  Total: {location.value}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GeoLocationMap;
