/* eslint-disable react-hooks/set-state-in-effect */
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { userData } from "../assets/userData";

const GeoLocationMap = () => {
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    // city coordinates
    const cityCoordinates = {
      Gurgaon: [28.4595, 77.0266],
      Delhi: [28.6139, 77.209],
      Mumbai: [19.076, 72.8777],
    };

    // count users per city
    const cityCount = {};

    userData.forEach((user) => {
      const city = user.locationName;
      cityCount[city] = (cityCount[city] || 0) + 1;
    });

    // convert to map format
    const formattedData = Object.keys(cityCount).map((city) => ({
      name: city,
      value: cityCount[city],
      lat: cityCoordinates[city][0],
      lng: cityCoordinates[city][1],
    }));

    setGeoData(formattedData);
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

      <div className="w-full h-[350px] rounded-3xl overflow-hidden shadow-lg">
        <MapContainer
          center={[20.5937, 78.9629]}
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
              radius={1 + location.value * 3}
              pathOptions={{
                color: "oklch(0.62 0.246 16.439)",
                fillColor: "oklch(0.82 0.245 27.325)",
                fillOpacity: 0.7,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-md">
                  <strong>{location.name}</strong>
                  <br />
                  Total Users: {location.value}
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
