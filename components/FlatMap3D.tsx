"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import countriesGeoJSON from "../public/custom.geo.json";
import emailjs from "@emailjs/browser";

interface MiningLocation {
  name: string;
  coordinates: [number, number];
  country: string;
  region: string;
  hashRate: string;
  facilitySize: string;
  availability: string;
  networkPercentage: string;
}

interface MiningDataByCountry {
  [key: string]: {
    hashRate: number;
    facilitySize: number;
    locations: number;
    networkPercentage: string;
  };
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormStatus {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Fix Leaflet default icon issue in Next.js
// if (typeof window !== 'undefined') {
//   delete L.Icon.Default.prototype._getIconUrl;
//   L.Icon.Default.mergeOptions({
//     iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   });
// }

const MapboxMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] =
    useState<MiningLocation | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  // Mock dataset of Bitcoin mining locations
  const miningLocations: MiningLocation[] = [
    {
      name: "Kazakhstan Mining Complex",
      coordinates: [66.9237, 48.0196],
      country: "Kazakhstan",
      region: "Akmola Region",
      hashRate: "164.79",
      facilitySize: "100",
      availability: "Open",
      networkPercentage: "14.8%",
    },
    {
      name: "Brazil Mining Center",
      coordinates: [-46.6333, -23.5505],
      country: "Brazil",
      region: "State of São Paulo",
      hashRate: "3.01",
      facilitySize: "25",
      availability: "Open",
      networkPercentage: "0.33%",
    },
    {
      name: "Ethiopia Mining Hub",
      coordinates: [40.4897, 9.145],
      country: "Ethiopia",
      region: "Addis Ababa",
      hashRate: "22.78",
      facilitySize: "50",
      availability: "Open",
      networkPercentage: "2.5%",
    },
    {
      name: "Indiana Mining Facility",
      coordinates: [-86.1349, 39.7684],
      country: "USA",
      region: "Indiana",
      hashRate: "165.68",
      facilitySize: "75",
      availability: "Open",
      networkPercentage: "35.4%",
    },
    {
      name: "Illinois Mining Complex",
      coordinates: [-89.3985, 40.6331],
      country: "USA",
      region: "Illinois",
      hashRate: "157",
      facilitySize: "75",
      availability: "Open",
      networkPercentage: "35.4%",
    },
    // { name: 'Nigeria Mining Center', coordinates: [3.3792, 6.5244], country: 'Nigeria', region: 'Lagos', hashRate: '40', facilitySize: '40', availability: 'Open' }
  ];

  const customIcon: L.DivIcon = new L.DivIcon({
    className: "mining-marker",
    html: `
      <div class="marker-inner">
        <div class="marker-pulse"></div>
        <div class="marker-dot"></div>
      </div>
    `,
    iconSize: [24, 24],
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setFormStatus({ isSubmitting: true, isSuccess: false, error: null });
    try {
      await emailjs.send(
        "service_v56md1p", // Replace with your EmailJS service ID
        "template_udglllb", // Replace with your EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          location_name: selectedLocation?.name || "Not specified",
          location_country: selectedLocation?.country || "Not specified",
          location_region: selectedLocation?.region || "Not specified",
        },
        "byVNdgtC-5hoSDIl_" // Replace with your EmailJS public key
      );
      setFormStatus({ isSubmitting: false, isSuccess: true, error: null });
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        error: "Failed to send message. Please try again.",
      });
    }
  };
  return (
    <div className="flex flex-col md:flex-row h-screen bg-transparent text-white">
      {/* Left Side: Summary */}
      <div className="md:w-1/4 p-6 md:border-r border-b md:border-b-0 border-gray-800 overflow-y-auto bg-transparent order-2 md:order-1 hidden lg:block">
        {/* Global Stats Box */}
        <div className="mb-6 p-4 rounded-xl backdrop-blur-md bg-black/60 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">
            Global Statistics
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">BTC Price</span>
              <span className="font-mono text-gray-300">$86,056.67</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Global Hash Rate</span>
              <span className="font-mono text-gray-300">693806.189 EH/s</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-white">
          Mining Facilities
        </h2>
        {Object.entries(
          miningLocations.reduce((acc, location) => {
            const key = location.country;
            if (!acc[key]) {
              acc[key] = {
                hashRate: 0,
                facilitySize: 0,
                networkPercentage: location.networkPercentage,
                locations: 0,
              };
            }
            acc[key].hashRate += parseFloat(location.hashRate);
            acc[key].facilitySize += parseInt(location.facilitySize);
            acc[key].locations += 1;
            return acc;
          }, {} as MiningDataByCountry)
        ).map(([country, data]) => (
          <div
            key={country}
            className="mb-4 p-4 rounded-xl backdrop-blur-md bg-black hover:bg-gray-800 transition-all duration-300 border border-gray-700 cursor-pointer"
          >
            <h3 className="font-bold text-xl mb-2 text-white">{country}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hash Rate</span>
                <span className="font-mono text-gray-300">
                  {data.hashRate} EH/s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network %</span>
                <span className="font-mono text-gray-300">
                  {data.networkPercentage}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Facility Size</span>
                <span className="font-mono text-gray-300">
                  {data.facilitySize} MW
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Center: Map */}
      <div className="h-screen md:h-screen md:flex-1 relative order-1 md:order-2">
        <div className="absolute inset-0 m-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-transparent">
          <MapContainer
            center={[30, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%", backgroundColor: "transparent" }}
            minZoom={2}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://stamen-tiles.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png"
              className="invert"
            />

            <GeoJSON
              data={countriesGeoJSON as GeoJSON.GeoJsonObject}
              onEachFeature={() => {}}
              style={{
                fillColor: "#fff",
                fillOpacity: 1,
                color: "#fff",
                weight: 1,
              }}
            />

            {Object.values(miningLocations)
              .flat()
              .map((location) => (
                <Marker
                  key={location.name}
                  position={[location.coordinates[1], location.coordinates[0]]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-4 bg-black/95 backdrop-blur-md rounded-lg shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {location.name}
                      </h3>
                      <p className="text-gray-300">🌍 {location.country}</p>
                      <p className="text-gray-300">
                        ⚡ {location.hashRate} TH/s
                      </p>
                      <p className="text-gray-300">
                        📊 {location.facilitySize} MW
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>

      {/* Right Side: Selected Location */}
      <div className="md:w-1/4 p-6 md:border-l border-t md:border-t-0 border-gray-800 overflow-y-auto bg-transparent order-3 ">
        <h2 className="text-2xl font-bold mb-6">Location Details</h2>
        {selectedLocation ? (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-black/60 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">
                {selectedLocation.name}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">Location</span>
                  <span className="font-medium text-gray-300">
                    {selectedLocation.country} ({selectedLocation.region})
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">Hash Rate</span>
                  <span className="font-mono text-gray-300">
                    {selectedLocation.hashRate} EH/S
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">Facility Size</span>
                  <span className="font-mono text-gray-300">
                    {selectedLocation.facilitySize} MW
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">Availability</span>
                  <span className="font-medium text-green-500">
                    {selectedLocation.availability}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-black/60 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">Build Now</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Your message here..."
                    required
                  ></textarea>
                </div>
                {formStatus.error && (
                  <div className="text-red-500 text-sm">{formStatus.error}</div>
                )}
                {formStatus.isSuccess && (
                  <div className="text-green-500 text-sm">
                    Message sent successfully!
                  </div>
                )}
                <button
                  type="submit"
                  disabled={formStatus.isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus.isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 rounded-xl bg-gray-900 border border-gray-700">
            <p className="text-gray-400">
              Select a location on the map to view details
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .inverted-map {
          filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(1.1)
            saturate(0.8);
          mix-blend-mode: difference;
        }

        .leaflet-container {
          background: #000000;
          margin: 1rem auto;
          height: calc(100% - 2rem) !important;
          width: calc(100% - 2rem) !important;
        }

        .mining-marker {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }

        .marker-inner {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          background: #60a5fa;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 24px;
          height: 24px;
          background: rgba(96, 165, 250, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .custom-popup .mapboxgl-popup-content {
          background: transparent;
          padding: 0;
          border-radius: 12px;
        }

        .custom-popup .mapboxgl-popup-tip {
          border-top-color: rgba(0, 0, 0, 0.95);
        }
      `}</style>
    </div>
  );
};

export default MapboxMap;
