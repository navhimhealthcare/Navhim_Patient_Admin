import appLogo from "../../../assets/images/appLogo.png";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import showToast from "../../../utils/toast";
import { useLoader } from "../../../App";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginAPI } from "../authAPI";
import { LOCAL_DATA_STORE } from "../../../utils/constants";
import { setLocalStorageItem } from "../../../utils/helpers";

export default function LoginPage() {
  const navigate = useNavigate();
  const { withLoader } = useLoader();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast.warn("Please fix the errors before continuing.");
      return;
    }

    setLoading(true);
    try {
      const data = await withLoader(
        () => loginAPI({ email: form.email, password: form.password }),
        "Signing you in…",
      );
      if (data?.success) {
        await setLocalStorageItem(
          LOCAL_DATA_STORE.JWT_TOKEN,
          data.data.accessToken,
        );
        await setLocalStorageItem(
          LOCAL_DATA_STORE.USER_DATA,
          JSON.stringify(data.data.admin),
        );
        showToast.success("Welcome back! Redirecting to dashboard…");
        setTimeout(() => navigate("/app/dashboard"), 800);
      } else {
        showToast.error(data.message);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password.";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-[fadeUp_0.4s_ease_both]">
        <div className="flex items-center gap-3 mb-8">
          <img
            src={appLogo}
            alt="Navhim Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-btn"
          />
          <h1 className="font-poppins font-bold text-[20px] text-navy tracking-tight">
            Navhim<span className="text-brand-primary"> Patient Admin</span>
          </h1>
        </div>
        <h2 className="font-poppins font-bold text-2xl text-navy mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-gray-400 mb-7">
          Sign in to your admin account
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="admin@hospital.com"
            value={form.email}
            onChange={handleChange}
            icon="📧"
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            icon="🔒"
            error={errors.password}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-brand-primary font-semibold hover:underline"
              onClick={() =>
                showToast.info("Password reset link sent to your email.", {
                  icon: true,
                })
              }
            >
              Forgot password?
            </button>
          </div>
          <Button
            type="submit"
            loading={loading}
            className="w-full justify-center mt-1"
          >
            Sign in
          </Button>
        </form>
        <p className="text-center text-xs text-gray-300 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
