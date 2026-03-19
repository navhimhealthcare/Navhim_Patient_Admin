import { FC, FormEvent, ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import showToast from "../../../utils/toast";
import { useLoader } from "../../../App";
import { changePasswordAPI } from "../authAPI";
import { logoutUser } from "../../../utils/helpers";

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  oldPassword?: string;
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

const ChangePasswordPage: FC = () => {
  const navigate = useNavigate();
  const { withLoader } = useLoader();

  const [form, setForm] = useState<ChangePasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!form.oldPassword) errs.oldPassword = "Current password is required";
    else if (form.oldPassword.length < 6) errs.oldPassword = "Invalid password";

    if (!form.newPassword) errs.newPassword = "New password is required";
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
    else if (form.newPassword === form.oldPassword)
      errs.newPassword = "New password must be different from current password";

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
          changePasswordAPI({
            oldPassword: form.oldPassword,
            newPassword: form.newPassword,
          }),
        "Updating your password…",
      )) as ApiResponse;

      if (data?.success) {
        showToast.success("Password changed successfully!");
        setSubmitted(true);
        logoutUser();
        setTimeout(() => {
          navigate("/login?session=expired");
        }, 1500);
      } else {
        showToast.error(data.message || "Failed to change password.");
      }
    } catch (err) {
      const error = err as ApiError;
      const msg =
        error?.response?.data?.message ||
        "Invalid current password. Please try again.";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    navigate(-1);
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

  const isFormValid = (): boolean => {
    return (
      form.oldPassword.length > 0 &&
      isPasswordRequirementsMet() &&
      form.confirmPassword === form.newPassword
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.3s_ease-out]">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-[slideUp_0.4s_ease-out]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-navy transition-colors"
          aria-label="Close dialog"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <h2 className="font-poppins font-bold text-2xl text-navy mb-1">
              Change password
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              Update your password to keep your account secure.
            </p>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              {/* Current Password */}
              <div className="relative">
                <Input
                  label="Current password"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.oldPassword}
                  onChange={handleChange}
                  icon="🔒"
                  error={errors.oldPassword}
                />
              </div>

              {/* New Password */}
              <div className="relative">
                <Input
                  label="New password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={handleChange}
                  icon="🔑"
                  error={errors.newPassword}
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  label="Confirm new password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  icon="✓"
                  error={errors.confirmPassword}
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-navy mb-2">
                  Password requirements:
                </p>
                <p
                  className={
                    form.newPassword.length >= 8 ? "text-green-600" : ""
                  }
                >
                  {form.newPassword.length >= 8 ? "✓" : "•"} At least 8
                  characters
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
                    /(?=.*[@$!%*?&])/.test(form.newPassword)
                      ? "text-green-600"
                      : ""
                  }
                >
                  {/(?=.*[@$!%*?&])/.test(form.newPassword) ? "✓" : "•"} Special
                  characters (@$!%*?&)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1 justify-center"
                  disabled={!isFormValid()}
                >
                  Update password
                </Button>
              </div>
            </form>

            {/* Security Info */}
            <p className="text-center text-xs text-gray-400 mt-6">
              🔒 Your password is encrypted and never stored in plain text.
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
                Password updated
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Your password has been successfully changed. You can now use
                your new password to sign in.
              </p>
              <Button onClick={handleClose} className="w-full justify-center">
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
