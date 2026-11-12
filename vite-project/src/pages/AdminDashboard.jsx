import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  FaUserShield,
  FaUsers,
  FaFolderOpen,
  FaLayerGroup,
  FaPlus,
  FaSignOutAlt,
  FaHistory,
  FaSync,
  FaUserPlus,
  FaTrash,
  FaMoneyCheckAlt,
  FaUniversity,
  FaMobileAlt,
  FaExchangeAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCog,
  FaSave,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("finishing_requests");

  const [usersList, setUsersList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [finishingRequests, setFinishingRequests] = useState([]);
  const [logsList, setLogsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Settings form state
  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: "National Bank of Egypt",
    account_name: "Finishing Services Corp",
    account_number: "12345678901234",
    iban: "EG123456789012345678901234567",
    vodafone_cash_number: "01012345678",
    instapay_address: "finishing@instapay",
  });
  const [settingsStatus, setSettingsStatus] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Receipt Modal state
  const [activeProofModal, setActiveProofModal] = useState(null);

  // User Creation Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
    status: "active",
  });
  const [userModalStatus, setUserModalStatus] = useState("");

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "" });

  // Service Modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newSvc, setNewSvc] = useState({
    title: "",
    category_id: "",
    unit: "sq_m",
    estimated_price_per_unit: "",
    description: "",
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, cRes, sRes, lRes, reqRes, settingsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/projects"),
        api.get("/categories"),
        api.get("/services"),
        api.get("/admin/logs"),
        api.get("/finishing-requests"),
        api.get("/payment-settings"),
      ]);

      if (uRes.data?.success) setUsersList(uRes.data.users);
      if (pRes.data?.success) setProjects(pRes.data.data);
      if (cRes.data?.success) setCategories(cRes.data.data);
      if (sRes.data?.success) setServices(sRes.data.data);
      if (lRes.data?.success) setLogsList(lRes.data.logs);
      if (reqRes.data?.success) setFinishingRequests(reqRes.data.data);
      if (settingsRes.data?.success) setPaymentSettings(settingsRes.data.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogsOnly = async () => {
    try {
      const res = await api.get("/admin/logs");
      if (res.data?.success) setLogsList(res.data.logs);
    } catch (err) {
      console.error("Error refreshing logs:", err);
    }
  };

  const handleUpdatePaymentStatus = async (requestId, payment_status) => {
    try {
      const res = await api.patch(`/admin/finishing-requests/${requestId}/status`, { payment_status });
      if (res.data?.success) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      alert(err.response?.data?.message || "Failed to update payment status.");
    }
  };

  const handleUpdatePaymentSettings = async (e) => {
    e.preventDefault();
    setSettingsStatus("");
    try {
      const res = await api.put("/admin/payment-settings", paymentSettings);
      if (res.data?.success) {
        setSettingsStatus("Payment settings updated successfully!");
        setShowSettingsModal(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Error updating payment settings:", err);
      setSettingsStatus(err.response?.data?.message || "Error updating payment settings.");
    }
  };

  const handleUpdateRole = async (userId, role, status) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role, status });
      fetchAdminData();
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserModalStatus("");

    try {
      const res = await api.post("/admin/users", newUser);
      if (res.data?.success) {
        setShowUserModal(false);
        setNewUser({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "client",
          status: "active",
        });
        fetchAdminData();
      } else {
        setUserModalStatus(res.data?.message || "Failed to create user.");
      }
    } catch (err) {
      setUserModalStatus(err.response?.data?.message || "Error creating user.");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/categories", newCat);
      if (res.data?.success) {
        setShowCategoryModal(false);
        setNewCat({ name: "", description: "" });
        fetchAdminData();
      }
    } catch (err) {
      console.error("Error creating category:", err);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/services", newSvc);
      if (res.data?.success) {
        setShowServiceModal(false);
        setNewSvc({ title: "", category_id: "", unit: "sq_m", estimated_price_per_unit: "", description: "" });
        fetchAdminData();
      }
    } catch (err) {
      console.error("Error creating service:", err);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleDeleteService = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete service "${title}"?`)) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes("REGISTER") || action.includes("CREATE")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (action.includes("LOGIN")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (action.includes("UPDATE") || action.includes("ROLE") || action.includes("STATUS")) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (action.includes("DELETE") || action.includes("SUSPENDED")) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (action.includes("PAYMENT")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-slate-700 text-slate-300 border-slate-600";
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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "bank_transfer":
        return <FaUniversity className="text-blue-400" />;
      case "vodafone_cash":
        return <FaMobileAlt className="text-red-400" />;
      case "instapay":
        return <FaExchangeAlt className="text-purple-400" />;
      default:
        return <FaMoneyCheckAlt className="text-slate-400" />;
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
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
            <FaUserShield /> Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600/20 px-3 py-2 text-xs font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition"
          >
            <FaCog /> Manage Payment Info
          </button>
          <div className="text-right text-sm hidden sm:block">
            <p className="font-semibold text-slate-200">{user?.name}</p>
            <p className="text-xs text-indigo-400">Super Administrator</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Platform Administration</h1>
            <p className="text-slate-400 mt-1">Review finishing requests, approve manual payment proofs, manage payment settings, user accounts, and activity logs.</p>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition w-fit"
          >
            <FaCog /> Configure Payment Accounts
          </button>
        </div>

        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
              <FaClock className="text-lg" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400">
              {finishingRequests.filter((r) => r.payment_status === "pending").length}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Payments</span>
              <FaCheckCircle className="text-lg" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">
              {finishingRequests.filter((r) => r.payment_status === "paid").length}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
              <FaUsers className="text-lg" />
            </div>
            <p className="text-2xl font-extrabold text-white">{usersList.length}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-blue-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projects</span>
              <FaFolderOpen className="text-lg" />
            </div>
            <p className="text-2xl font-extrabold text-white">{projects.length}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Services</span>
              <FaLayerGroup className="text-lg" />
            </div>
            <p className="text-2xl font-extrabold text-white">{services.length}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Activity Logs</span>
              <FaHistory className="text-lg" />
            </div>
            <p className="text-2xl font-extrabold text-purple-400">{logsList.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-8 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("finishing_requests")}
            className={`pb-3 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "finishing_requests"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FaMoneyCheckAlt /> Finishing Requests & Payment Verification ({finishingRequests.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 font-semibold text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            User Permissions ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 font-semibold text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === "catalog"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Categories & Services
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-3 font-semibold text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === "projects"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            All Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-3 font-semibold text-sm transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "logs"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FaHistory /> Audit Logs ({logsList.length})
          </button>
        </div>

        {/* TAB 1: FINISHING REQUESTS & PAYMENT VERIFICATION */}
        {activeTab === "finishing_requests" && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/60 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaMoneyCheckAlt className="text-emerald-400" /> Manual Payment Approval Queue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect uploaded proof receipts (Bank Transfer, Vodafone Cash, InstaPay) and update payment status to Paid or Rejected.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Request Title</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Proof Receipt</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 font-sans">
                  {finishingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                        No finishing requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    finishingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-xs">{req.user?.name || "Client"}</p>
                          <p className="text-[11px] text-slate-400">{req.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          <div>{req.title}</div>
                          <span className="text-[11px] font-normal text-slate-400">{req.category?.name || "General"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-xs text-slate-200">
                            {getPaymentMethodIcon(req.payment_method)}
                            <span>{getPaymentMethodLabel(req.payment_method)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                          {req.payment_reference || <span className="text-slate-500 font-sans italic">None</span>}
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
                            <span className="text-xs text-slate-500 italic">No file</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${
                            req.payment_status === "paid" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                            req.payment_status === "rejected" ? "bg-red-500/20 text-red-400 border-red-500/40" :
                            "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          }`}>
                            {req.payment_status === "paid" ? <FaCheckCircle /> : req.payment_status === "rejected" ? <FaTimesCircle /> : <FaClock />}
                            {req.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={req.payment_status}
                            onChange={(e) => handleUpdatePaymentStatus(req.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold px-3 py-1.5 outline-none focus:border-emerald-500 text-slate-200 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid (Approve)</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & PERMISSIONS */}
        {activeTab === "users" && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/60 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Users & Role Access Control</h3>
                <p className="text-xs text-slate-400">Manage user accounts and assign system roles (Admin, Engineer, Client, Contractor, Supplier).</p>
              </div>
              <button
                onClick={() => setShowUserModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <FaUserPlus /> Create New User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Assigned Role</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 font-mono text-slate-400">#{u.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.phone || "—"}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value, u.status)}
                          className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 text-indigo-300 outline-none focus:border-indigo-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="engineer">Engineer</option>
                          <option value="client">Client</option>
                          <option value="contractor">Contractor</option>
                          <option value="supplier">Supplier</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.status}
                          onChange={(e) => handleUpdateRole(u.id, u.role, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 text-emerald-400 outline-none focus:border-emerald-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        <span className="text-emerald-400 font-semibold">Configured ✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES & SERVICES */}
        {activeTab === "catalog" && (
          <div className="space-y-8">
            {/* Categories */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Service Categories</h3>
                  <p className="text-xs text-slate-400">Organize finishing offerings by industry categories.</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <FaPlus /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div key={c.id} className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white">{c.name}</h4>
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="text-red-400 hover:text-red-300 p-1 text-xs transition"
                          title="Delete Category"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {c.services?.length || 0} Services
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Finishing Services Catalog</h3>
                  <p className="text-xs text-slate-400">Manage individual services, unit metrics, and pricing.</p>
                </div>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <FaPlus /> Add Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white">{s.title}</h4>
                        <button
                          onClick={() => handleDeleteService(s.id, s.title)}
                          className="text-red-400 hover:text-red-300 p-1 text-xs transition"
                          title="Delete Service"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <p className="text-xs text-indigo-400 mt-0.5">{s.category?.name || "Uncategorized"}</p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-xs font-bold">
                      <span className="text-emerald-400">${Number(s.estimated_price_per_unit).toFixed(2)} / {s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ALL PROJECTS */}
        {activeTab === "projects" && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/60">
              <h3 className="text-lg font-bold text-white">Global Projects Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Contractor</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 font-bold text-white">{p.title}</td>
                      <td className="px-6 py-4 text-slate-300">{p.client?.name}</td>
                      <td className="px-6 py-4 text-slate-300">{p.contractor?.name || "Unassigned"}</td>
                      <td className="px-6 py-4 font-semibold text-white">${Number(p.budget).toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">{p.progress_percentage}%</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE ACTIVITY LOGS */}
        {activeTab === "logs" && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/60 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaHistory className="text-purple-400" /> Database Activity Audit Trail
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time database log of all user registrations, logins, project updates, task execution, and payments.
                </p>
              </div>

              <button
                onClick={fetchLogsOnly}
                className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                <FaSync /> Refresh Audit Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Log ID</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 font-sans">
                  {logsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                        No activity logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-700/30">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">#{log.id}</td>
                        <td className="px-6 py-4 text-xs text-slate-300 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white text-xs">{log.user_name || "Guest / System"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border uppercase tracking-wider ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-200">{log.description}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip_address || "127.0.0.1"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* VIEW RECEIPT PROOF LIGHTBOX MODAL */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Payment Receipt Proof</h3>
              <button onClick={() => setActiveProofModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div><span className="text-slate-500">Client:</span> <strong className="text-white">{activeProofModal.user?.name}</strong></div>
              <div><span className="text-slate-500">Request:</span> <strong className="text-white">{activeProofModal.title}</strong></div>
              <div><span className="text-slate-500">Method:</span> <strong className="text-blue-400">{getPaymentMethodLabel(activeProofModal.payment_method)}</strong></div>
              <div><span className="text-slate-500">Reference:</span> <strong className="text-indigo-300 font-mono">{activeProofModal.payment_reference || "N/A"}</strong></div>
            </div>

            <div className="max-h-[450px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-2 flex justify-center items-center">
              {activeProofModal.payment_proof_url ? (
                <img src={activeProofModal.payment_proof_url} alt="Payment Proof" className="max-w-full h-auto rounded-lg" />
              ) : (
                <p className="text-xs text-slate-500">No image proof file uploaded</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Change Status:</span>
                <select
                  value={activeProofModal.payment_status}
                  onChange={(e) => {
                    handleUpdatePaymentStatus(activeProofModal.id, e.target.value);
                    setActiveProofModal({ ...activeProofModal, payment_status: e.target.value });
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold px-3 py-1 text-slate-200"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (Approve)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

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

      {/* ADMIN PAYMENT SETTINGS MANAGEMENT MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaCog className="text-indigo-400" /> Manage Payment Information
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure account numbers displayed to users during payment selection.</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdatePaymentSettings} className="space-y-6">
              {/* Bank Transfer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FaUniversity /> Bank Transfer Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Bank Name</label>
                    <input
                      required
                      type="text"
                      value={paymentSettings.bank_name}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Account Holder Name</label>
                    <input
                      required
                      type="text"
                      value={paymentSettings.account_name}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, account_name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Account Number</label>
                    <input
                      required
                      type="text"
                      value={paymentSettings.account_number}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, account_number: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">IBAN Number</label>
                    <input
                      required
                      type="text"
                      value={paymentSettings.iban}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, iban: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Vodafone Cash & InstaPay Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FaMobileAlt /> Vodafone Cash Number
                  </h4>
                  <input
                    required
                    type="text"
                    value={paymentSettings.vodafone_cash_number}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, vodafone_cash_number: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FaExchangeAlt /> InstaPay Address
                  </h4>
                  <input
                    required
                    type="text"
                    value={paymentSettings.instapay_address}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, instapay_address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {settingsStatus && (
                <p className="text-xs text-emerald-400 font-semibold">{settingsStatus}</p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 shadow-md flex items-center gap-2"
                >
                  <FaSave /> Save Account Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Create New Account</h3>
            <p className="text-xs text-slate-400 mb-4">Select exact role: Admin, Engineer, or Client.</p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+1 555-0199"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assign User Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="admin">Admin (System Administrator)</option>
                  <option value="engineer">Engineer (Technical Specialist)</option>
                  <option value="client">Client (Property Owner)</option>
                  <option value="contractor">Contractor (Project Manager)</option>
                  <option value="supplier">Supplier (Materials Provider)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  required
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {userModalStatus && <p className="text-xs text-red-400">{userModalStatus}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 shadow-md"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Service Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category Name</label>
                <input
                  required
                  type="text"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Masonry & Plaster"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Category scope and details..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Finishing Service</h3>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service Title</label>
                <input
                  required
                  type="text"
                  value={newSvc.title}
                  onChange={(e) => setNewSvc({ ...newSvc, title: e.target.value })}
                  placeholder="e.g. Epoxy Floor Coating"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newSvc.category_id}
                  onChange={(e) => setNewSvc({ ...newSvc, category_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newSvc.unit}
                    onChange={(e) => setNewSvc({ ...newSvc, unit: e.target.value })}
                    placeholder="sq_m, point, hour"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price / Unit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSvc.estimated_price_per_unit}
                    onChange={(e) => setNewSvc({ ...newSvc, estimated_price_per_unit: e.target.value })}
                    placeholder="35.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSvc.description}
                  onChange={(e) => setNewSvc({ ...newSvc, description: e.target.value })}
                  placeholder="Service details..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
