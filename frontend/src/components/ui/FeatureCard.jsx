import { Link } from "react-router-dom";

export default function FeatureCard({ title, description, to, icon }) {
  return (
    <Link
      to={to}
      className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all"
    >
      <div className="text-blue-700 mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 text-center">{title}</h3>
      <p className="text-gray-600 text-center text-sm mt-1">{description}</p>
    </Link>
  );
}