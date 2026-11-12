import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";

const signupSchema = yup.object({
  name: yup.string().required("Full name is required."),
  email: yup.string().email("Enter a valid email address.").required("Email is required."),
  phone: yup.string().nullable(),
  role: yup.string().oneOf(["admin", "engineer", "contractor", "client", "supplier"]).required("Please select a role."),
  password: yup.string().min(6, "Password must be at least 6 characters.").required("Password is required."),
});

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setStatus("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      const values = await signupSchema.validate(formValues, { abortEarly: false });
      setIsSubmitting(true);
      setErrors({});

      const result = await signup(values);

      if (result.success) {
        if (result.role === "admin") navigate("/admin");
        else if (result.role === "engineer" || result.role === "contractor") navigate("/contractor");
        else navigate("/dashboard");
      } else {
        setStatus(result.message);
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const valErrors = {};
        error.inner.forEach((e) => {
          if (e.path && !valErrors[e.path]) {
            valErrors[e.path] = e.message;
          }
        });
        setErrors(valErrors);
      } else {
        setStatus("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link to="/" className="text-blue-600 font-semibold hover:underline text-sm inline-block mb-4">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">Join Local Works Finishing Platform</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              value={formValues.name}
              onChange={updateField}
              placeholder="Sarah Johnson"
              className="w-full h-10 rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={formValues.email}
              onChange={updateField}
              placeholder="sarah@example.com"
              className="w-full h-10 rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
            <input
              name="phone"
              type="text"
              value={formValues.phone}
              onChange={updateField}
              placeholder="+1 555-0199"
              className="w-full h-10 rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
            <select
              name="role"
              value={formValues.role}
              onChange={updateField}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
            >
              <option value="client">Client / Property Owner</option>
              <option value="engineer">Engineer / Technical Specialist</option>
              <option value="admin">Admin / System Manager</option>
              <option value="contractor">Contractor / Project Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formValues.password}
              onChange={updateField}
              placeholder="••••••••"
              className="w-full h-10 rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {status && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg bg-indigo-600 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Register Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
