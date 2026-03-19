import { useLocation } from "react-router-dom";
import { cn } from "../../../utils/helpers";

const CONTENT_MAP: Record<string, { title: string; icon: string; content: string }> = {
  "/app/support": {
    title: "Support",
    icon: "🤝",
    content: "Need help? Our support team is available 24/7 to assist with any technical issues or platform inquiries. Contact us via the helpdesk.",
  },
  "/app/terms": {
    title: "Terms & Conditions",
    icon: "📄",
    content: "By using Navhim Patient Admin, you agree to our terms of service. This includes responsible use of data and adherence to healthcare regulations.",
  },
  "/app/why-navhim": {
    title: "Why Navhim",
    icon: "🚀",
    content: "Navhim is built by healthcare professionals for healthcare professionals. We focus on speed, reliability, and ease of use to improve patient outcomes.",
  },
  "/app/aboutUs": {
    title: "About Us",
    icon: "🏥",
    content: "Navhim is a leading healthcare technology provider dedicated to modernizing hospital administration through innovative software solutions.",
  },
};

export default function StaticContentPage() {
  const location = useLocation();
  const data = CONTENT_MAP[location.pathname] || {
    title: "Information",
    icon: "ℹ️",
    content: "Content is being updated. Please check back later.",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-[fadeUp_0.4s_ease_both]">
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-gradient p-8 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl pointer-events-none">
            {data.icon}
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-lg">
              {data.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-poppins">{data.title}</h1>
              <p className="text-white/60 text-sm mt-1">Last updated: March 2026</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-navy font-bold text-lg mb-4">Introduction</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {data.content}
            </p>
            
            <div className="bg-surface rounded-2xl p-6 border border-brand-primary/10">
              <h4 className="text-brand-primary font-bold text-sm uppercase tracking-wider mb-2">Key Highlights</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Enterprise Grade Security", "HIPAA Compliant", "24/7 Priority Support", "Continuous Updates"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-navy/70 text-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <p className="text-gray-500 text-xs mt-10 italic">
              * This is a generated informational page for demonstration purposes. For official legal documents, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
