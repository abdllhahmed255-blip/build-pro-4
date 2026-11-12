import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import registrationImage from "../img/login.png";

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email address is required."),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters.")
    .required("Password is required."),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setStatus("");
  };

  const handleLoginSubmit = async (emailToUse, passwordToUse) => {
    setStatus("");
    setIsSubmitting(true);

    try {
      const result = await login(emailToUse, passwordToUse, rememberMe);

      if (result.success) {
        setFormValues({ email: "", password: "" });
        if (result.role === "admin") {
          navigate("/admin");
        } else if (result.role === "contractor" || result.role === "engineer") {
          navigate("/contractor");
        } else {
          navigate("/dashboard");
        }
      } else {
        setStatus(result.message);
      }
    } catch (err) {
      setStatus("Unable to sign in. Please verify your credentials and connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const values = await loginSchema.validate(formValues, { abortEarly: false });
      setErrors({});
      await handleLoginSubmit(values.email, values.password);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          if (err.path && !validationErrors[err.path]) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        setStatus("An error occurred during validation.");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ================= LEFT SIDE (IMAGE) ================= */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${registrationImage})` }}
      />

      {/* ================= RIGHT SIDE (FORM) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[480px]">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="text-blue-600 font-bold hover:underline mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900">Sign in to your account</h1>
            <p className="mt-2 text-slate-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Register here
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" noValidate onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-900">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={formValues.email}
                onChange={updateField}
                placeholder="name@company.com"
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full h-11 rounded-lg border border-slate-300 px-4 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-900">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formValues.password}
                onChange={updateField}
                placeholder="••••••••"
                aria-describedby={errors.password ? "password-error" : undefined}
                className="w-full h-11 rounded-lg border border-slate-300 px-4 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-indigo-600 text-white font-semibold text-base transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            {status && (
              <div role="status" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center font-medium">
                {status}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}