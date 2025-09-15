import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo-1.png';
import axios from 'axios';
import { BASE_URL } from './utils/constants';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user_id = sessionStorage.getItem('mapbox_unique');
    if (user_id) navigate('/mapbox');
  }, [navigate]);

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setBusy(true);
      const response = await axios.post(
        `${BASE_URL}/login/`,
        { email: username, password },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response?.data?.status) {
        sessionStorage.setItem('mapbox_unique', response?.data?.user_id);
        navigate('/mapbox');
      } else {
        setError(response?.data?.error || 'Login failed');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(1200px 800px at 10% 10%, rgba(79,70,229,0.35) 0%, rgba(14,165,233,0.25) 35%, rgba(6,182,212,0.15) 55%, rgba(2,6,23,0.9) 100%)',
      }}
    >
      {/* Glow elements */}
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-60"
           style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }} />
      <div className="absolute -bottom-32 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-50"
           style={{ background: 'linear-gradient(135deg, #22c55e, #0ea5e9)' }} />

      {/* Glassmorphism container */}
      <div
        className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        }}
      >
        {/* Left Hero Section */}
        <div className="relative hidden md:flex items-end justify-center bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400">
          <div className="absolute inset-0 opacity-20"
               style={{
                 backgroundImage:
                   'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 1px)',
                 backgroundSize: '22px 22px',
               }} />
          <div className="relative z-10 text-white p-10 w-full">
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="must analytics" className="h-10 w-auto drop-shadow" />
              <span className="text-lg font-semibold">must analytics</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight drop-shadow">
              Welcome back, <br /> let’s map something beautiful.
            </h2>
            <p className="mt-4 text-white/90">
              Secure access to your models, layers, and AI processing — all in one place.
            </p>
          </div>
        </div>

        {/* Right Login Form */}
        <div
          className="px-8 py-10 sm:px-10 sm:py-12"
          style={{
            background:
              'linear-gradient(135deg, rgba(30,41,59,0.85), rgba(17,24,39,0.95))',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-3 mb-6">
              <img src={logo} alt="must analytics" className="h-10 w-auto" />
              <span className="text-white text-lg font-semibold">must analytics</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-6 drop-shadow">
              Sign in
            </h1>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {/* Email */}
            <label className="block text-white/90 text-sm mb-1">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mb-4 w-full rounded-lg bg-white text-gray-900 border border-gray-200 px-4 py-2.5 shadow focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            {/* Password */}
            <label className="block text-white/90 text-sm mb-1">Password</label>
            <div className="relative mb-6">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-lg bg-white text-gray-900 border border-gray-200 px-4 py-2.5 shadow focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 my-auto text-sky-500 hover:text-sky-700 text-sm px-2"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="inline-flex items-center text-white/80 text-sm">
                <input type="checkbox" className="mr-2 accent-cyan-400" /> Remember me
              </label>
              <a href="#" className="text-cyan-400 hover:text-white text-sm">Forgot password?</a>
            </div>

            {/* Buttons */}
            <button
              onClick={handleLogin}
              disabled={busy}
              className={`w-full py-2.5 rounded-lg font-medium text-white shadow-lg transition
                ${busy
                  ? 'bg-cyan-500/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:brightness-110'}`}
            >
              {busy ? 'Signing in…' : 'Login'}
            </button>

            <button
              type="button"
              className="mt-3 w-full py-2.5 rounded-lg font-medium text-cyan-400 border border-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-white transition"
            >
              Create an account
            </button>

            {/* Footer text */}
            <p className="mt-6 text-center text-xs text-white/70">
              Protected by reCAPTCHA and the Google{" "}
              <a className="underline hover:text-white" href="#">Privacy Policy</a> and{" "}
              <a className="underline hover:text-white" href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
