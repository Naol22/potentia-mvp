"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import countriesGeoJSON from "../public/custom.geo.json";
import emailjs from "@emailjs/browser";
import { ChevronLeft, ChevronRight, Globe, DollarSign, Box, Wrench, Power, Cpu, Gauge, Lightbulb, Camera, Video, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion'; // <-- Add this import
import Link from "next/link";

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

// Component to access the map instance
const MapController = ({ setMap }: { setMap: (map: L.Map) => void }) => {
  const map = useMap();
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
}

const MapboxMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<MiningLocation | null>(null);
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
  const [map, setMap] = useState<L.Map | null>(null);

  // Store marker references
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  // Mock dataset of Bitcoin mining locations
  const miningLocations: MiningLocation[] = [
    {
      name: "Ethiopia",
      coordinates: [38.7578, 9.0301],
      country: "Ethiopia",
      region: "Adiss Ababa",
      hashRate: "164.79",
      facilitySize: "100",
      availability: "Open",
      networkPercentage: "14.8%",
    },
    {
      name: "Dubai",
      coordinates: [55.2708, 25.2048],
      country: "Dubai",
      region: "Dubai",
      hashRate: "3.01",
      facilitySize: "25",
      availability: "Open",
      networkPercentage: "0.33%",
    },
    {
      name: "Texas, Fort Worth",
      coordinates: [-97.3308, 32.7555],
      country: "Texas, Fort Worth",
      region: "Texas",
      hashRate: "22.78",
      facilitySize: "50",
      availability: "Open",
      networkPercentage: "2.5%",
    },
    {
      name: "Paraguay, Villarica",
      coordinates: [-56.2231, -25.7495],
      country: "Paraguay, Villarica",
      region: "Villarica",
      hashRate: "165.68",
      facilitySize: "75",
      availability: "Open",
      networkPercentage: "35.4%",
    },
    {
      name: "Georgia, Tbilisi",
      coordinates: [44.7930, 41.7151],
      country: "Georgia, Tbilisi",
      region: "Tbilisi",
      hashRate: "157",
      facilitySize: "75",
      availability: "Open",
      networkPercentage: "35.4%",
    },
    {
      name: "Finland, Heat Recovery",
      coordinates: [24.9384, 60.1699],
      country: "Finland, Heat Recovery",
      region: "Finland",
      hashRate: "157",
      facilitySize: "75",
      availability: "Open",
      networkPercentage: "35.4%",
    },
  ];

  // Facilities data
  const facilities = [
    {
      name: 'Ethiopia',
      generalInfo: {
        source: 'Hydro Power',
        minerType: 'ASIC Miner',
        capacity: '30 MW',
        innovation: 'Heat Recovery System',
        surveillance: '24/7',
        uptime: '99.9%',
        ecoFriendly: true,
      },
      hostingInfo: {
        price: '4.0ct / kWh',
        minOrder: '1 piece',
        setupFee: '$150',
      },
    },
    {
      name: 'Dubai',
      generalInfo: {
        source: 'Solar/Grid',
        minerType: 'ASIC Miner',
        capacity: '15 MW',
        innovation: 'Smart Grid Integration',
        surveillance: '24/7',
        uptime: '99.8%',
        ecoFriendly: true,
      },
      hostingInfo: {
        price: '8.0ct / kWh',
        minOrder: '2 pieces',
        setupFee: '$50',
      },
    },
    {
      name: 'Texas, Fort Worth',
      generalInfo: {
        source: 'Mains Power',
        minerType: 'Warehouse Miner',
        capacity: '25 MW',
        innovation: 'Advanced Cooling',
        surveillance: '24/7',
        uptime: '99.7%',
        ecoFriendly: true,
      },
      hostingInfo: {
        price: '7.8ct / kWh',
        minOrder: '1 piece',
        setupFee: '$1050',
      },
    },
    {
      name: 'Paraguay, Villarica',
      generalInfo: {
        source: 'Hydro Power',
        minerType: 'Warehouse Miner',
        capacity: '10 MW',
        innovation: 'Smart Grid Integration',
        surveillance: '24/7',
        uptime: '99.9%',
        ecoFriendly: true,
      },
      hostingInfo: {
        price: '7.8ct / kWh',
        minOrder: '1 piece',
        setupFee: '$50',
      },
    },
    {
      name: 'Georgia, Tbilisi',
      generalInfo: {
        source: 'Hydro Power',
        minerType: 'Warehouse/Container',
        capacity: '5 MW',
        innovation: 'Modular Design',
        surveillance: '24/7',
        uptime: '99.6%',
        ecoFriendly: true,
      },
      hostingInfo: {
        price: '10.5ct / kWh',
        minOrder: '1 piece',
        setupFee: '-',
      },
    },
    {
      name: 'Finland, Heat Recovery',
      generalInfo: {
        source: 'Mixed',
        minerType: 'Hydro Miner',
        capacity: '10 MW',
        innovation: 'District Heating Integration',
        surveillance: '24/7',
        uptime: '99.8%',
        ecoFriendly: true,
      },
      hostingInfo: {
        price: '8.0ct / kWh',
        minOrder: '1 piece',
        setupFee: '-',
      },
    },
  ];

  const [showTourModal, setShowTourModal] = useState(false);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);

  const openVirtualTour = (facilityName: string) => {
    const tourMapping: Record<string, string> = {
      'Ethiopia': 'ethiopia',
      'Dubai': 'dubai',
      'Texas, Fort Worth': 'texas',
      'Paraguay, Villarica': 'paraguay',
      'Georgia, Tbilisi': 'georgia',
      'Finland, Heat Recovery': 'finland'
    };
    
    const tourId = tourMapping[facilityName];
    if (tourId) {
      setCurrentTourId(tourId);
      setShowTourModal(true);
    }
  };
  
  const closeTourModal = () => {
    setShowTourModal(false);
    setCurrentTourId(null);
  };

  // Map countries to their location names
  const countryToLocations = miningLocations.reduce((acc, location) => {
    if (!acc[location.country]) {
      acc[location.country] = [];
    }
    acc[location.country].push(location.name);
    return acc;
  }, {} as { [key: string]: string[] });

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
        "service_v56md1p",
        "template_udglllb",
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          location_name: selectedLocation?.name || "Not specified",
          location_country: selectedLocation?.country || "Not specified",
          location_region: selectedLocation?.region || "Not specified",
        },
        "byVNdgtC-5hoSDIl_"
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
    <motion.div
      className="flex flex-col md:flex-row h-[82vh] bg-transparent text-white"
      initial={{ opacity: 0, scale: 0.96, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 18,
        duration: 0.7
      }}
    >
      {/* Left Side: Summary */}
      <motion.div
        className="md:w-1/4 p-6 md:border-r border-b md:border-b-0 border-gray-800 overflow-y-auto bg-transparent order-2 md:order-1 hidden lg:block"
        style={{ scrollbarWidth: "none" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 18,
          duration: 1.5 // <-- changed from 0.7 to 1.5
        }}
      >
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
            className="mb-4 p-4 rounded-xl backdrop-blur-md bg-black hover:bg-gray-800 transition-all duration-300 border border-gray-700 cursor-pointer relative"
            onClick={() => {
              const locationNames = countryToLocations[country];
              if (locationNames && locationNames.length > 0) {
                const firstLocationName = locationNames[0];
                const location = miningLocations.find(
                  (loc) => loc.name === firstLocationName
                );
                if (location && map) {
                  map.flyTo([location.coordinates[1], location.coordinates[0]], 5, {
                    duration: 1,
                  });
                  const marker = markerRefs.current[firstLocationName];
                  if (marker) {
                    setTimeout(() => {
                      marker.openPopup();
                    }, 1000);
                  }
                }
              }
            }}
          >
            <h3 className="font-bold text-xl mb-2 text-white">{country}</h3>
            <div className="space-y-2 text-sm">
              {(() => {
                const facility = facilities.find(f => f.name === country);
                if (facility && facility.hostingInfo) {
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Price</span>
                        <span className="font-mono text-gray-300">
                          {facility.hostingInfo.price}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Min Order</span>
                        <span className="font-mono text-gray-300">
                          {facility.hostingInfo.minOrder}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Setup Fee</span>
                        <span className="font-mono text-gray-300">
                          {facility.hostingInfo.setupFee}
                        </span>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <div className="text-gray-400">No hosting info available.</div>
                  );
                }
              })()}
            </div>
            <div className="flex justify-end mt-4">
              {country === "Ethiopia" ? (
                <Link
                  href={{
                    pathname: "/details",
                    query: { country: country }
                  }}
                  passHref
                >
                  <button
                    className="buy-host-button cursor-pointer"
                  >
                    Buy Host
                  </button>
                </Link>
              ) : (
                <button
                  className="buy-host-button cursor-not-allowed opacity-60 pointer-events-none"
                  disabled
                >
                  Buy Host
                </button>
              )}
            </div>
            {/* Status flag at bottom left */}
            <div
              className={`absolute left-4 bottom-4 flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md
                ${country === "Ethiopia"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"}
              `}
              style={{
                minWidth: 30,
                justifyContent: "center",
                letterSpacing: "0.05em",
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)",
                border: "none",
              }}
            >
              <span
                className={`inline-block w-1/5 h-2 rounded-full mr-2
                  ${country === "Ethiopia" ? "bg-green-300" : "bg-red-300"}
                `}
              ></span>
              {country === "Ethiopia" ? "Active" : "Inactive"}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Center: Map */}
      <div className="relative flex-1 h-[85vh] order-1 md:order-2 w-full">
        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 z-[1000] flex flex-row gap-3">
          <button
            className="bg-black/40 hover:bg-black/60 text-white rounded-full p-3 shadow-lg transition-all"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => map?.zoomOut()}
            aria-label="Zoom Out"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            className="bg-black/40 hover:bg-black/60 text-white rounded-full p-3 shadow-lg transition-all"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => map?.zoomIn()}
            aria-label="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {/* Transparent gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.0) 0%, rgba(255,255,255,0.0) 100%)",
            width: "100vw",
            height: "100%",
            pointerEvents: "none",
          }}
        />
        <MapContainer
          center={[30, 0]}
          zoom={2}
          style={{
            height: "100%",
            width: "100vw",
            backgroundColor: "transparent",
            position: "relative",
            zIndex: 1,
          }}
          minZoom={2}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          zoomControl={false}
          attributionControl={false}
          doubleClickZoom={false}
          scrollWheelZoom={false} // <-- Ensure this is set to false
        >
          <MapController setMap={setMap} />
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
          {miningLocations.map((location) => (
            <Marker
              key={location.name}
              position={[location.coordinates[1], location.coordinates[0]]}
              icon={customIcon}
              ref={(ref) => {
                if (ref) markerRefs.current[location.name] = ref;
              }}
              eventHandlers={{
                click: () => setSelectedLocation(location),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-4 bg-black/95 backdrop-blur-md rounded-lg shadow-xl min-w-[300px]">
                  <h3 className="text-lg font-bold text-white mb-2">{location.name}</h3>
                  <p className="text-gray-300 mb-4">🌍 {location.country}</p>
                  {(() => {
                    const facility = facilities.find(f => f.name === location.name);
                    if (facility) {
                      return (
                        <div>
                          <h4 className="text-white font-bold mb-2">General Information</h4>
                          <ul className="list-none space-y-1 text-gray-300">
                            <li>
                              <Power className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Source:</span> {facility.generalInfo.source}
                            </li>
                            <li>
                              <Cpu className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Miner Type:</span> {facility.generalInfo.minerType}
                            </li>
                            <li>
                              <Gauge className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Capacity:</span> {facility.generalInfo.capacity}
                            </li>
                            <li>
                              <Lightbulb className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Innovation:</span> {facility.generalInfo.innovation}
                            </li>
                            <li>
                              <Camera className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Surveillance:</span> {facility.generalInfo.surveillance}
                            </li>
                            <li>
                              <ChevronRight className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Uptime:</span> {facility.generalInfo.uptime}
                            </li>
                            <li>
                              <Box className="w-4 h-4 mr-2 inline" />
                              <span className="font-medium">Eco-Friendly:</span> {facility.generalInfo.ecoFriendly ? 'Yes' : 'No'}
                            </li>
                          </ul>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                openVirtualTour(facility.name);
                              }}
                              className="mt-auto relative flex justify-center items-center bg-black text-white rounded-full py-2 px-4 min-w-[120px] group"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <span className="transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                                Virtual Tour
                              </span>
                              <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-full bg-white">
                                <Globe className="w-5 h-5 text-black" />
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return <p className="text-gray-300">No general info available.</p>;
                    }
                  })()}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Add Tour Modal */}
      {showTourModal && currentTourId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
          <div className="absolute top-4 right-4 z-[10000]">
            <button 
              onClick={closeTourModal}
              className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="w-screen h-screen relative">
            <iframe
              src={`/api/tours/${currentTourId}`}
              title="Virtual Tour"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      )}

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

        .buy-host-button {
          background: radial-gradient(
              circle at 20% 30%, 
              rgba(255,255,255,0.05),
              #ffffff
            ),
            linear-gradient(
              135deg,
              #ffffff,
              #ffffff 45%,
              rgba(0,0,0,0.1) 50%,
              #ffffff 55%,
              #ffffff
            );
          background-size: 200% 200%;
          animation: flowAnimation 20s linear infinite, goldenGlow 2s infinite;
          color: #000;
          padding: 8px 16px;
          border-radius: 9999px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .buy-host-button:hover {
          transform: scale(1.05);
        }

        @keyframes flowAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes goldenGlow {
          0% {
            box-shadow: 0 0 5px 2px rgba(255, 215, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 10px 4px rgba(255, 215, 0, 0.7);
          }
          100% {
            box-shadow: 0 0 5px 2px rgba(255, 215, 0, 0.5);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default MapboxMap;