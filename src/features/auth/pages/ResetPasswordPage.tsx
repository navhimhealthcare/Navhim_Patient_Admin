import { FC, FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useLocation, LocationState } from "react-router-dom";
import appLogo from "../../../assets/images/appLogo.png";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import showToast from "../../../utils/toast";
import { useLoader } from "../../../App";
import { resetPasswordAPI } from "../authAPI";

interface ResetPasswordForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LocationStateWithEmail extends LocationState {
  email?: string;
}

const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const location = useLocation() as { state?: LocationStateWithEmail };

  const [form, setForm] = useState<ResetPasswordForm>({
    email: location.state?.email || "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  useEffect(() => {
    if (!form.email) {
      showToast.warn("Please request a password reset first.");
      navigate("/auth/forgot-password");
    }
  }, [form.email, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!form.code) errs.code = "Reset code is required";
    else if (form.code.length < 6)
      errs.code = "Code must be at least 6 characters";

    if (!form.newPassword) errs.newPassword = "Password is required";
    else if (form.newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])/.test(form.newPassword))
      errs.newPassword = "Password must contain lowercase letters";
    else if (!/(?=.*[A-Z])/.test(form.newPassword))
      errs.newPassword = "Password must contain uppercase letters";
    else if (!/(?=.*\d)/.test(form.newPassword))
      errs.newPassword = "Password must contain numbers";
    else if (!/(?=.*[@$!%*?&])/.test(form.newPassword))
      errs.newPassword = "Password must contain special characters (@$!%*?&)";

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast.warn("Please fix the errors before continuing.");
      return;
    }

    setLoading(true);
    try {
      const data = (await withLoader(
        () =>
          resetPasswordAPI({
            email: form.email,
            code: form.code,
            newPassword: form.newPassword,
          }),
        "Resetting your password…"
      )) as ApiResponse;

      if (data?.success) {
        showToast.success("Password reset successfully! Redirecting to login…");
        setTimeout(() => navigate("/auth/login"), 1500);
      } else {
        showToast.error(data.message || "Failed to reset password.");
      }
    } catch (err) {
      const error = err as ApiError;
      const msg =
        error?.response?.data?.message ||
        "Invalid code or error occurred. Please try again.";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordRequirementsMet = (): boolean => {
    return (
      form.newPassword.length >= 8 &&
      /(?=.*[a-z])/.test(form.newPassword) &&
      /(?=.*[A-Z])/.test(form.newPassword) &&
      /(?=.*\d)/.test(form.newPassword) &&
      /(?=.*[@$!%*?&])/.test(form.newPassword)
    );
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      {/* Background Gradient Orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-[fadeUp_0.4s_ease_both]">
        {/* Header */}
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

        {/* Content */}
        <h2 className="font-poppins font-bold text-2xl text-navy mb-1">
          Create new password
        </h2>
        <p className="text-sm text-gray-400 mb-7">
          Enter the code from your email and set a strong new password.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Reset Code Input */}
          <Input
            label="Reset code"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={form.code}
            onChange={handleChange}
            icon="🔐"
            error={errors.code}
          />

          {/* Password Input */}
          <div className="relative">
            <Input
              label="New password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.newPassword}
              onChange={handleChange}
              icon="🔒"
              error={errors.newPassword}
            />
            {/* <button
              type="button"
              className="absolute right-4 top-10 text-gray-500 hover:text-navy transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button> */}
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              icon="✓"
              error={errors.confirmPassword}
            />
            {/* <button
              type="button"
              className="absolute right-4 top-10 text-gray-500 hover:text-navy transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button> */}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-navy mb-2">
              Password requirements:
            </p>
            <p className={form.newPassword.length >= 8 ? "text-green-600" : ""}>
              {form.newPassword.length >= 8 ? "✓" : "•"} At least 8 characters
            </p>
            <p
              className={
                /(?=.*[a-z])/.test(form.newPassword) ? "text-green-600" : ""
              }
            >
              {/(?=.*[a-z])/.test(form.newPassword) ? "✓" : "•"} Lowercase
              letters
            </p>
            <p
              className={
                /(?=.*[A-Z])/.test(form.newPassword) ? "text-green-600" : ""
              }
            >
              {/(?=.*[A-Z])/.test(form.newPassword) ? "✓" : "•"} Uppercase
              letters
            </p>
            <p
              className={
                /(?=.*\d)/.test(form.newPassword) ? "text-green-600" : ""
              }
            >
              {/(?=.*\d)/.test(form.newPassword) ? "✓" : "•"} Numbers
            </p>
            <p
              className={
                /(?=.*[@$!%*?&])/.test(form.newPassword) ? "text-green-600" : ""
              }
            >
              {/(?=.*[@$!%*?&])/.test(form.newPassword) ? "✓" : "•"} Special
              characters (@$!%*?&)
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            loading={loading}
            className="w-full justify-center mt-2"
            disabled={!isPasswordRequirementsMet() || !form.code}
          >
            Reset password
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-navy font-medium transition-colors"
            onClick={() => navigate("/auth/login")}
          >
            ← Back to sign in
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Didn't receive a code?{" "}
          <span
            className="text-brand-primary cursor-pointer hover:underline"
            onClick={() => navigate("/auth/forgot-password")}
          >
            Request again
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
