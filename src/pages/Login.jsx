import React, { useState } from 'react';
import { loginUser } from '../api/user.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result instanceof Error) {
        toast.error(result.message);
      } else if (result.account_type_id !== 1) {
        toast.error("Akun ini tidak memiliki akses.");
      } else {
        // Set session (token or any session key)
        localStorage.setItem('token', result.token || '1');
        toast.success('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">

        <div className="mb-2">
            <img src="icon.png" alt="" />
        </div>

        <h2 className="text-2xl font-bold text-center mt-2">Welcome back</h2>
        <p className="text-gray-500 text-center mb-6 mt-1 text-sm">
          Please enter your details to sign in
        </p>

        <form className="w-full" onSubmit={userLogin}>
          <div className="w-full mb-4">
            <label className="block text-gray-700 text-sm mb-1">Your Email Address</label>
            <input
              type="email"
              placeholder="Your Email Address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="w-full mb-2 relative">
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="**********"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.7 10.7a2 2 0 102.6 2.6M7.36 7.36A8.96 8.96 0 003 12c2.5 4 6.5 6 9 6 1.13 0 2.26-.22 3.36-.64M16.64 16.64A8.96 8.96 0 0021 12c-2.5-4-6.5-6-9-6-1.13 0-2.26.22-3.36.64"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 100-6 3 3 0 000 6z"/></svg>
              )}
            </button>
          </div>

          <button
            className="w-full py-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold shadow hover:from-gray-800 hover:to-gray-600 transition mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;