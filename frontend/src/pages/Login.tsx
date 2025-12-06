const Login = () => {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/airtable/login`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-[420px] bg-white rounded-2xl border border-gray-200 shadow-xl p-12 text-center">

        {/* Orange Logo */}
        <div className="mx-auto mb-8 w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-3xl font-bold">
          A
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Airtable Builder
        </h1>

        <p className="text-gray-500 text-sm mb-8">
          Build powerful dynamic forms directly from your Airtable schema.
        </p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-orange-600 text-white font-semibold text-lg hover:bg-orange-700 active:scale-95 transition-all"
        >
          Login with Airtable
        </button>

        <p className="text-gray-400 text-xs mt-6">
          Secure OAuth • No passwords stored
        </p>
      </div>
    </div>
  );
};

export default Login;
