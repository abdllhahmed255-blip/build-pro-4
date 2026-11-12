import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  FaHardHat,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaProjectDiagram,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ContractorDashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState({});

  // Task creation modal
  const [addingTaskStageId, setAddingTaskStageId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      if (res.data?.success) {
        setProjects(res.data.data);
        if (res.data.data.length > 0) {
          setExpandedProjects((prev) => (Object.keys(prev).length === 0 ? { [res.data.data[0].id]: true } : prev));
        }
      }
    } catch (err) {
      console.error("Error fetching contractor projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTaskStatusChange = async (taskId, currentStatus) => {
    const nextStatus =
      currentStatus === "pending"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "completed"
        : "pending";

    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      fetchProjects();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleUpdateProjectStatus = async (projectId, status) => {
    try {
      await api.put(`/projects/${projectId}`, { status });
      fetchProjects();
    } catch (err) {
      console.error("Error updating project status:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!addingTaskStageId || !newTaskTitle.trim()) return;

    try {
      const res = await api.post("/tasks", {
        stage_id: addingTaskStageId,
        title: newTaskTitle.trim(),
        status: "pending",
      });

      if (res.data?.success) {
        setAddingTaskStageId(null);
        setNewTaskTitle("");
        fetchProjects();
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // Calculate totals
  let totalTasks = 0;
  let completedTasks = 0;

  projects.forEach((p) => {
    if (p.stages) {
      p.stages.forEach((s) => {
        if (s.tasks) {
          totalTasks += s.tasks.length;
          completedTasks += s.tasks.filter((t) => t.status === "completed").length;
        }
      });
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-extrabold text-blue-500 tracking-wide">
            LOCAL WORKS
          </Link>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <FaHardHat /> Contractor Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm hidden sm:block">
            <p className="font-semibold text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400">Project Manager</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Contractor Control Panel</h1>
          <p className="text-slate-400 mt-1">Manage assigned finishing projects, stage execution, and task updates.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Assigned Projects</span>
              <FaProjectDiagram className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-white">{projects.length}</p>
            <p className="text-xs text-slate-400 mt-1">Under active management</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Tasks</span>
              <FaTasks className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-white">{totalTasks}</p>
            <p className="text-xs text-slate-400 mt-1">{completedTasks} Completed</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Task Completion Rate</span>
              <FaCheckCircle className="text-2xl" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-400">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Overall team execution</p>
          </div>
        </div>

        {/* Projects & Stage Task Management */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaHardHat className="text-amber-500" /> Assigned Projects & Milestones
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading contractor projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700/50 text-slate-400">
              No projects currently assigned to you.
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((proj) => {
                const isExpanded = expandedProjects[proj.id];
                return (
                  <div key={proj.id} className="bg-slate-800/80 border border-slate-700/70 rounded-2xl overflow-hidden">
                    {/* Project Header Bar */}
                    <div
                      onClick={() => toggleExpand(proj.id)}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-700/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-lg">
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                              Client: {proj.client?.name || "Standard Client"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{proj.location || "Site location not set"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Status Select */}
                        <select
                          value={proj.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateProjectStatus(proj.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-amber-400 font-semibold px-3 py-1.5 rounded-lg"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Progress Badge */}
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span className="font-bold text-white">{proj.progress_percentage}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${proj.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Stages & Task Checklist */}
                    {isExpanded && (
                      <div className="border-t border-slate-700/70 p-6 bg-slate-950/40 space-y-6">
                        {proj.stages && proj.stages.length > 0 ? (
                          proj.stages.map((stg) => (
                            <div key={stg.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-sm text-slate-200">{stg.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                    stg.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                                  }`}>
                                    {stg.status}
                                  </span>
                                  <button
                                    onClick={() => setAddingTaskStageId(stg.id)}
                                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
                                  >
                                    <FaPlus /> Add Task
                                  </button>
                                </div>
                              </div>

                              {/* Task List */}
                              <div className="space-y-2">
                                {stg.tasks && stg.tasks.length > 0 ? (
                                  stg.tasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs"
                                    >
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => handleTaskStatusChange(task.id, task.status)}
                                          className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                                            task.status === "completed"
                                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                                              : task.status === "in_progress"
                                              ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                              : "border-slate-600 hover:border-slate-400"
                                          }`}
                                        >
                                          {task.status === "completed" && <FaCheckCircle className="text-xs" />}
                                          {task.status === "in_progress" && <FaClock className="text-xs" />}
                                        </button>
                                        <span className={task.status === "completed" ? "line-through text-slate-400 font-medium" : "text-slate-200 font-medium"}>
                                          {task.title}
                                        </span>
                                      </div>

                                      <button
                                        onClick={() => handleTaskStatusChange(task.id, task.status)}
                                        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                                      >
                                        Status: <span className="text-amber-400 capitalize">{task.status.replace("_", " ")}</span>
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-500 italic">No tasks created for this stage yet.</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">No stages defined for this project.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal for adding a task */}
      {addingTaskStageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Task to Stage</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Inspect plaster surface smoothness"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddingTaskStageId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-500"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
