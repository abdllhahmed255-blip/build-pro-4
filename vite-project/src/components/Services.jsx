import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaBuilding,
  FaBolt,
  FaTools,
  FaLayerGroup,
  FaPaintBrush,
  FaWrench,
} from "react-icons/fa";
import api from "../api/axios";

// Helper to select an icon based on title/category
const getServiceIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("paint") || t.includes("velvet") || t.includes("decor")) return FaPaintBrush;
  if (t.includes("electric") || t.includes("light")) return FaBolt;
  if (t.includes("plumb") || t.includes("sanitary") || t.includes("pipe")) return FaTools;
  if (t.includes("floor") || t.includes("tile") || t.includes("porcelain")) return FaLayerGroup;
  if (t.includes("exterior") || t.includes("facade")) return FaBuilding;
  if (t.includes("interior") || t.includes("gypsum")) return FaHome;
  return FaWrench;
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    api
      .get("/services")
      .then((res) => {
        if (isMounted && res.data?.success) {
          setServices(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load services from API:", err);
        if (isMounted) setError("Unable to load services catalog from database.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="services" className="min-h-screen scroll-mt-16 bg-[#0F1B2E] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-white">
          Our Finishing Services Catalog
        </h2>
        <p className="mb-12 text-center text-sm text-slate-400 max-w-2xl mx-auto">
          Explore real-time finishing solutions sourced directly from our database.
        </p>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading service catalog...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : services.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No finishing services in catalog yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = getServiceIcon(service.title);
              const price = service.estimated_price_per_unit
                ? `$${Number(service.estimated_price_per_unit).toFixed(2)} / ${service.unit || 'unit'}`
                : null;

              return (
                <div
                  key={service.id}
                  className="group rounded-2xl border border-slate-700 bg-[#14243B] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400 flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl text-cyan-400 transition-all duration-300 group-hover:bg-cyan-400 group-hover:text-white">
                      <Icon />
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {service.title}
                    </h3>

                    {service.category?.name && (
                      <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        {service.category.name}
                      </span>
                    )}

                    <p className="mt-3 leading-7 text-slate-400 text-sm">
                      {service.description}
                    </p>
                  </div>

                  {price && (
                    <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-bold text-emerald-400 flex justify-between items-center">
                      <span>Rate:</span>
                      <span className="text-sm">{price}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}