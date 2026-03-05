// PaymentSuccess.jsx
export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-green-600">✅ Payment Successful!</h1>
      <p className="text-gray-500 mt-2">Your subscription has been activated!</p>
      <a href="/dashboard" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Go to Dashboard
      </a>
    </div>
  );
}