import { FC, FormEvent, ChangeEvent, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import appLogo from "../../../assets/images/appLogo.png";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import showToast from "../../../utils/toast";
import { useLoader } from "../../../App";
import { forgotPasswordAPI } from "../authAPI";

interface FormErrors {
  email?: string;
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

const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const initialized = useRef(false);

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
  }, []);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      errs.email = "Enter a valid email address";
    return errs;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
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
        () => forgotPasswordAPI({ email }),
        "Sending reset code…"
      )) as ApiResponse;
      
      if (data?.success) {
        showToast.success("Reset code sent! Check your email.");
        setSubmitted(true);
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 1500);
      } else {
        showToast.error(data.message || "Failed to send reset code.");
      }
    } catch (err) {
      const error = err as ApiError;
      const msg =
        error?.response?.data?.message || "Email not found or error occurred.";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
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

        {!submitted ? (
          <>
            {/* Content */}
            <h2 className="font-poppins font-bold text-2xl text-navy mb-1">
              Reset your password
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              Enter your email address and we'll send you a code to reset your
              password.
            </p>

            {/* Form */}
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
                value={email}
                onChange={handleChange}
                icon="📧"
                error={errors.email}
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full justify-center mt-2"
              >
                Send reset code
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-navy font-medium transition-colors"
                onClick={() => navigate("/login")}
              >
                ← Back to sign in
              </button>
            </div>

            <p className="text-center text-xs text-gray-300 mt-6">
              Didn't receive a code? Check your spam folder.
            </p>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-[scaleIn_0.5s_ease-out]">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-poppins font-bold text-2xl text-navy mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-400 mb-1">
                We've sent a reset code to:
              </p>
              <p className="text-sm font-semibold text-navy mb-6">{email}</p>
              <p className="text-xs text-gray-300">
                Redirecting to reset password page…
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
