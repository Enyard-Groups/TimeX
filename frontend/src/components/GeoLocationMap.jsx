/* eslint-disable react-hooks/set-state-in-effect */
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { userData } from "../assets/userData";

const GeoLocationMap = () => {
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    const cityCoordinates = {
      Gurgaon: [28.4595, 77.0266],
      Delhi: [28.6139, 77.209],
      Mumbai: [19.076, 72.8777],
      Bangalore: [12.9716, 77.5946],
      Hyderabad: [17.385, 78.4867],
      Pune: [18.5204, 73.8567],
      Chennai: [13.0827, 80.2707],
      Kolkata: [22.5726, 88.3639],
      Noida: [28.5355, 77.391],
      Ahmedabad: [23.0225, 72.5714],
    };

    const cityCount = {};

    userData.forEach((user) => {
      const city = user.locationName;
      cityCount[city] = (cityCount[city] || 0) + 1;
    });

    const formattedData = Object.keys(cityCount).map((city) => ({
      name: city,
      value: cityCount[city],
      lat: cityCoordinates[city][0],
      lng: cityCoordinates[city][1],
    }));

    setGeoData(formattedData);
  }, []);

  const createCircleIcon = (value) => {
    const size = 20 + value * 2;

    return L.divIcon({
      className: "custom-circle-marker",
      html: `
      <div style="
        width:${size}px;
        height:${size}px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        font-size:11px;
        font-weight:600;
        color:white;
        background: radial-gradient(
          circle at 30% 30%,
          oklch(0.72 0.24 16.439 / 0.7),
          oklch(0.645 0.246 16.439 / 0.85)
        );
        backdrop-filter:blur(3px);
        box-shadow:
          0 6px 12px rgba(0,0,0,0.25),
          inset -2px -2px 4px rgba(0,0,0,0.25),
          inset 2px 2px 4px rgba(255,255,255,0.2);
      ">
        ${value}
      </div>
    `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className=" border border-red-400 p-0.5 rounded">
      <div
        className="w-full h-[325px] rounded overflow-hidden relative z-0 border border-yellow-600"
        style={{ scrollbarWidth: "none" }}
      >
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={false}
          className="h-full w-full "
        >
          <TileLayer
            attribution=""
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {geoData.map((location, index) => (
            <Marker
              key={index}
              position={[location.lat, location.lng]}
              icon={createCircleIcon(location.value)}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-sm">
                  <strong>{location.name}</strong>
                  <br />
                  Users: {location.value}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GeoLocationMap;
