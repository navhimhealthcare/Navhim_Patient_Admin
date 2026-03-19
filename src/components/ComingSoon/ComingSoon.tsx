import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-24 h-24 mb-6 bg-brand-primary/10 rounded-full flex items-center justify-center animate-pulse">
        <span className="text-4xl">🚀</span>
      </div>
      <h1 className="font-poppins font-bold text-3xl text-navy mb-3">
        Coming Soon
      </h1>
      <p className="text-gray-400 max-w-md mb-8">
        We're working hard to bring you this feature. Stay tuned for updates!
      </p>
      <Button
        onClick={() => navigate("/app/dashboard")}
        icon={null}
        className=""
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
