import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { slides } from "./slides";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, role, logout } = useAuth();

  // Automatic Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Previous Slide
  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Next Slide
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin";
    if (role === "contractor" || role === "engineer") return "/contractor";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed left-0 top-0 z-50 w-full bg-white shadow-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FaBuilding className="text-3xl text-blue-600" />
            <span className="text-xl font-bold text-blue-600 sm:text-2xl">
              Build Pro
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-md text-xl text-slate-700 md:hidden"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Navigation */}
          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } absolute left-0 top-16 w-full flex-col gap-2 border-t border-slate-200 bg-white px-4 py-4 shadow-md md:static md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none`}
          >
            <a
              href="#home"
              onClick={() => setIsMenuOpen(false)}
              className="px-2 py-2 font-semibold text-slate-700 transition hover:text-blue-600 md:p-0"
            >
              Home
            </a>

            <a
              href="#services"
              onClick={() => setIsMenuOpen(false)}
              className="px-2 py-2 font-semibold text-slate-700 transition hover:text-blue-600 md:p-0"
            >
              Services
            </a>

            <a
              href="#about"
              onClick={() => setIsMenuOpen(false)}
              className="px-2 py-2 font-semibold text-slate-700 transition hover:text-blue-600 md:p-0"
            >
              About
            </a>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-bold transition hover:bg-blue-100"
                >
                  <FaUserCircle /> My Portal ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="px-2 py-2 text-left font-semibold text-red-600 transition hover:text-red-700 md:p-0"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-2 py-2 font-semibold text-slate-700 transition hover:text-blue-600 md:p-0"
                >
                  Login
                </Link>

                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mx-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:shadow-xl md:mx-0"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================= HERO SLIDER ================= */}
      <section id="home" className="relative min-h-[620px] scroll-mt-16 overflow-hidden pt-16 sm:h-screen">
        {/* Background */}
        <img
          src={slides[current].image}
          alt={slides[current].title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="px-12 sm:px-14 lg:px-16">
            <h1 className="max-w-[750px] text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {slides[current].title}
            </h1>

            <p className="mt-6 max-w-[750px] text-lg leading-8 text-white/90 sm:mt-7 sm:text-xl sm:leading-9 md:text-2xl">
              {slides[current].description}
            </p>

            {/* Get Started */}
            <Link
              to={isAuthenticated ? getDashboardPath() : "/login"}
              className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              {isAuthenticated ? "Open My Dashboard" : "Get Started Now"}
            </Link>
          </div>
        </div>

        {/* ================= ARROWS ================= */}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 z-20 -translate-y-1/2 text-5xl text-white/80 transition hover:scale-110 hover:text-white"
        >
          <FaChevronLeft />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 z-20 -translate-y-1/2 text-5xl text-white/80 transition hover:scale-110 hover:text-white"
        >
          <FaChevronRight />
        </button>

        {/* ================= DOTS ================= */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full transition-all ${
                current === index
                  ? "w-8 bg-white"
                  : "w-3 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}