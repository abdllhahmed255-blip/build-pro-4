import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  FaFolderOpen,
  FaFileInvoiceDollar,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaWrench,
  FaCreditCard,
  FaSignOutAlt,
  FaUniversity,
  FaMobileAlt,
  FaExchangeAlt,
  FaFileUpload,
  FaTimesCircle,
  FaInfoCircle,
  FaEye,
  FaReceipt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [finishingRequests, setFinishingRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: "National Bank of Egypt",
    account_name: "Finishing Services Corp",
    account_number: "12345678901234",
    iban: "EG123456789012345678901234567",
    vodafone_cash_number: "01012345678",
    instapay_address: "finishing@instapay",
  });
  const [loading, setLoading] = useState(true);

  // New Request Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);

  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category_id: "",
    budget: "",
    location: "",
  });
  const [requestStatus, setRequestStatus] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // View Receipt Modal state
  const [activeProofModal, setActiveProofModal] = useState(null);

  // Payment Modal state for invoices
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projRes, invRes, catRes, reqRes, settingsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/invoices"),
        api.get("/categories"),
        api.get("/finishing-requests"),
        api.get("/payment-settings"),
      ]);

      if (projRes.data?.success) setProjects(projRes.data.data);
      if (invRes.data?.success) setInvoices(invRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (reqRes.data?.success) setFinishingRequests(reqRes.data.data);
      if (settingsRes.data?.success) setPaymentSettings(settingsRes.data.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProofFile(file);
      setProofPreviewUrl(URL.createObjectURL(file));
    } else {
      setPaymentProofFile(null);
      setProofPreviewUrl(null);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setRequestStatus("");
    setSubmittingRequest(true);

    try {
      const formData = new FormData();
      formData.append("title", newRequest.title);
      if (newRequest.description) formData.append("description", newRequest.description);
      if (newRequest.category_id) formData.append("category_id", newRequest.category_id);
      if (newRequest.budget) formData.append("budget", newRequest.budget);
      if (newRequest.location) formData.append("location", newRequest.location);
      
      formData.append("payment_method", selectedPaymentMethod);
      if (paymentReference) formData.append("payment_reference", paymentReference);
      if (paymentProofFile) formData.append("payment_proof", paymentProofFile);

      const res = await api.post("/finishing-requests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        setShowRequestModal(false);
        setNewRequest({ title: "", description: "", category_id: "", budget: "", location: "" });
        setPaymentReference("");
        setPaymentProofFile(null);
        setProofPreviewUrl(null);
        setSelectedPaymentMethod("bank_transfer");
        fetchDashboardData();
      } else {
        setRequestStatus(res.data?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setRequestStatus(err.response?.data?.message || "Error submitting finishing request with payment proof.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setPaymentStatus("");

    try {
      const res = await api.post("/payments", {
        invoice_id: payingInvoice.id,
        amount: payingInvoice.amount,
        payment_method: paymentMethod,
      });

      if (res.data?.success) {
        setPayingInvoice(null);
        fetchDashboardData();
      } else {
        setPaymentStatus(res.data?.message || "Payment failed.");
      }
    } catch (err) {
      setPaymentStatus("Payment error occurred.");
    }
  };

  const unpaidTotal = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 w-fit">
            <FaCheckCircle className="text-emerald-400" /> Paid / Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 w-fit">
            <FaTimesCircle className="text-red-400" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 w-fit">
            <FaClock className="text-amber-400" /> Pending Admin Review
          </span>
        );
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "bank_transfer":
        return <FaUniversity className="text-blue-400 text-lg" />;
      case "vodafone_cash":
        return <FaMobileAlt className="text-red-400 text-lg" />;
      case "instapay":
        return <FaExchangeAlt className="text-purple-400 text-lg" />;
      default:
        return <FaReceipt className="text-slate-400 text-lg" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer";
      case "vodafone_cash":
        return "Vodafone Cash";
      case "instapay":
        return "InstaPay";
      default:
        return method?.replace("_", " ");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-extrabold text-blue-500 tracking-wide">
            LOCAL WORKS
          </Link>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            Client Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm hidden sm:block">
            <p className="font-semibold text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-red-600/20 px-3 py-2 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-600/30 transition"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header & Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
            <p className="text-slate-400 mt-1">Track your finishing requests, manual payment statuses, and project billing.</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition"
          >
            <FaPlus /> Request New Finishing Work
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Finishing Requests</span>
              <FaFolderOpen className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-white">{finishingRequests.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total requests submitted</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pending Payments</span>
              <FaClock className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400">
              {finishingRequests.filter((r) => r.payment_status === "pending").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Awaiting admin review</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Approved Payments</span>
              <FaCheckCircle className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-400">
              {finishingRequests.filter((r) => r.payment_status === "paid").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Verified & confirmed</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Active Projects</span>
              <FaWrench className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-white">{projects.length}</p>
            <p className="text-xs text-slate-400 mt-1">In progress & ongoing</p>
          </div>
        </div>

        {/* Finishing Requests Table with Payments */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaReceipt className="text-blue-500" /> My Finishing Requests & Payment Statuses
            </h2>
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg transition"
            >
              + Submit Request
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading requests...</div>
          ) : finishingRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <p className="text-slate-300 font-semibold text-lg">No finishing requests submitted yet.</p>
              <p className="text-slate-400 text-sm mt-1">Submit your first request with payment proof to get started!</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 transition"
              >
                Submit Finishing Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/60 shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Request Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Proof Receipt</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {finishingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-bold text-white">
                        <div>{req.title}</div>
                        {req.location && <span className="text-xs text-slate-400">{req.location}</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{req.category?.name || "General Finishing"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-slate-200">
                          {getPaymentMethodIcon(req.payment_method)}
                          <span>{getPaymentMethodLabel(req.payment_method)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                        {req.payment_reference || <span className="text-slate-500 font-sans italic">Not provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        {req.payment_proof_url ? (
                          <button
                            onClick={() => setActiveProofModal(req)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-blue-400 font-semibold hover:bg-slate-800 hover:border-blue-500 transition"
                          >
                            <FaEye /> View Receipt
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No receipt file</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(req.payment_status)}</td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Projects Overview */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaFolderOpen className="text-blue-500" /> Ongoing Construction & Finishing Projects
          </h2>

          {projects.length === 0 ? (
            <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 text-slate-400 text-sm">
              No active projects linked yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                        <p className="text-xs text-slate-400">{proj.location || "Location not specified"}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        proj.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        proj.status === "in_progress" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                        "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {proj.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">{proj.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                        <span>Overall Progress</span>
                        <span>{proj.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${proj.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Budget: <strong className="text-slate-200">${Number(proj.budget).toFixed(2)}</strong></span>
                    <span>PM: <strong className="text-slate-200">{proj.contractor?.name || "Assigning..."}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* NEW FINISHING REQUEST WITH PAYMENT METHOD MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-white">Create Finishing Request</h3>
                <p className="text-xs text-slate-400 mt-1">Provide project details and upload manual payment receipt.</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white text-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              {/* Project Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">1. Project Specifications</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title *</label>
                    <input
                      required
                      type="text"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      placeholder="e.g. Interior Apartment Painting & Plastering"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Service Category</label>
                    <select
                      value={newRequest.category_id}
                      onChange={(e) => setNewRequest({ ...newRequest, category_id: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Budget ($)</label>
                    <input
                      type="number"
                      value={newRequest.budget}
                      onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Property Location / Address</label>
                    <input
                      type="text"
                      value={newRequest.location}
                      onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                      placeholder="e.g. Building 12, New Cairo"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Details & Description</label>
                  <textarea
                    rows={2}
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Describe specific finishing materials, colors, or scope..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Selectable Payment Method Cards */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">2. Choose Payment Method *</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Bank Transfer */}
                  <div
                    onClick={() => setSelectedPaymentMethod("bank_transfer")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between relative ${
                      selectedPaymentMethod === "bank_transfer"
                        ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xl">
                        <FaUniversity />
                      </div>
                      {selectedPaymentMethod === "bank_transfer" && (
                        <FaCheckCircle className="text-blue-500 text-lg" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Bank Transfer</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Wire to official company IBAN account</p>
                    </div>
                  </div>

                  {/* Card 2: Vodafone Cash */}
                  <div
                    onClick={() => setSelectedPaymentMethod("vodafone_cash")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between relative ${
                      selectedPaymentMethod === "vodafone_cash"
                        ? "bg-red-600/20 border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/20"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xl">
                        <FaMobileAlt />
                      </div>
                      {selectedPaymentMethod === "vodafone_cash" && (
                        <FaCheckCircle className="text-red-500 text-lg" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Vodafone Cash</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Direct wallet transfer number</p>
                    </div>
                  </div>

                  {/* Card 3: InstaPay */}
                  <div
                    onClick={() => setSelectedPaymentMethod("instapay")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between relative ${
                      selectedPaymentMethod === "instapay"
                        ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xl">
                        <FaExchangeAlt />
                      </div>
                      {selectedPaymentMethod === "instapay" && (
                        <FaCheckCircle className="text-purple-500 text-lg" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">InstaPay</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Instant payment address / IPA</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Payment Account Instructions fetched from Backend API */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <FaInfoCircle className="text-sm" />
                    <span>Payment Account Details ({getPaymentMethodLabel(selectedPaymentMethod)}):</span>
                  </div>

                  {selectedPaymentMethod === "bank_transfer" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
                      <div><span className="text-slate-500">Bank Name:</span> <strong className="text-white font-sans">{paymentSettings.bank_name}</strong></div>
                      <div><span className="text-slate-500">Account Name:</span> <strong className="text-white font-sans">{paymentSettings.account_name}</strong></div>
                      <div><span className="text-slate-500">Account #:</span> <strong className="text-blue-400">{paymentSettings.account_number}</strong></div>
                      <div><span className="text-slate-500">IBAN:</span> <strong className="text-blue-400">{paymentSettings.iban}</strong></div>
                    </div>
                  )}

                  {selectedPaymentMethod === "vodafone_cash" && (
                    <div className="text-slate-300 font-mono">
                      <span className="text-slate-500">Vodafone Cash Number:</span>{" "}
                      <strong className="text-red-400 text-sm font-sans">{paymentSettings.vodafone_cash_number}</strong>
                    </div>
                  )}

                  {selectedPaymentMethod === "instapay" && (
                    <div className="text-slate-300 font-mono">
                      <span className="text-slate-500">InstaPay Address:</span>{" "}
                      <strong className="text-purple-400 text-sm font-sans">{paymentSettings.instapay_address}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Proof & Transaction Reference */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">3. Upload Proof & Reference Number</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Reference / ID</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. TXN-984210492 or Ref #12345"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Payment Proof (Receipt Image / PDF)</label>
                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full bg-slate-800 border border-dashed border-slate-600 hover:border-amber-500 rounded-xl p-3 text-xs text-slate-300 font-semibold hover:bg-slate-700/50 transition">
                      <FaFileUpload className="text-amber-400 text-base" />
                      <span>{paymentProofFile ? paymentProofFile.name : "Choose receipt image file"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {proofPreviewUrl && (
                  <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                    <img src={proofPreviewUrl} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                    <div className="text-xs text-slate-400">
                      <p className="font-bold text-slate-200">Receipt Image Attached</p>
                      <p>{paymentProofFile?.name} ({(paymentProofFile?.size / 1024).toFixed(1)} KB)</p>
                    </div>
                  </div>
                )}
              </div>

              {requestStatus && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {requestStatus}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
                >
                  {submittingRequest ? "Submitting..." : "Submit Request & Payment Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT PROOF MODAL */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Payment Receipt Proof</h3>
              <button onClick={() => setActiveProofModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-3 mb-4 text-xs">
              <p><span className="text-slate-400">Request:</span> <strong className="text-white">{activeProofModal.title}</strong></p>
              <p><span className="text-slate-400">Payment Method:</span> <strong className="text-blue-400">{getPaymentMethodLabel(activeProofModal.payment_method)}</strong></p>
              <p><span className="text-slate-400">Reference:</span> <strong className="text-indigo-300 font-mono">{activeProofModal.payment_reference || "N/A"}</strong></p>
            </div>

            <div className="max-h-96 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-2 flex justify-center items-center">
              {activeProofModal.payment_proof_url ? (
                <img src={activeProofModal.payment_proof_url} alt="Payment Proof" className="max-w-full h-auto rounded-lg" />
              ) : (
                <p className="text-xs text-slate-500">No image available</p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveProofModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Process Payment</h3>
            <p className="text-sm text-slate-400 mb-4">
              Invoice #{payingInvoice.invoice_number} — <strong className="text-emerald-400">${Number(payingInvoice.amount).toFixed(2)}</strong>
            </p>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="bank_transfer">Bank Wire Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                </select>
              </div>

              <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-400">
                🔒 Secure encrypted payment gateway simulation.
              </div>

              {paymentStatus && <p className="text-xs text-red-400">{paymentStatus}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500"
                >
                  Confirm & Pay ${Number(payingInvoice.amount).toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
