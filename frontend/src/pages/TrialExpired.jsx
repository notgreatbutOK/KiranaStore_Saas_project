import { useNavigate } from "react-router-dom";

export default function TrialExpired() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded shadow text-center max-w-md">

        <div className="text-6xl mb-4">⏰</div>

        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Trial Expired
        </h2>

        <p className="text-gray-500 mb-6">
          Your 14 day free trial has ended. Please contact the platform admin to activate a subscription and continue using Kirana SaaS.
        </p>

        <div className="bg-gray-50 rounded p-4 mb-6 text-sm text-gray-600">
          <p>📧 Contact: <span className="font-semibold">super@saas.com</span></p>
          <p className="mt-1">💰 Plans: Monthly / Yearly</p>
        </div>

        <button
          onClick={logout}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}