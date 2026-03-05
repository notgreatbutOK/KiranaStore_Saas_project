export default function PaymentFailure() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50">
      <div className="bg-white shadow rounded p-10 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Payment Failed!</h1>
        <p className="text-gray-500 mb-2">Something went wrong with your payment.</p>
        <p className="text-gray-400 text-sm mb-6">Please try again or contact support.</p>
        <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}