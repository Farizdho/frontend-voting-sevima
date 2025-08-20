import { useState } from 'react';
import api, { setToken } from '../api';

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      setToken(data.token);
      onLogin(data);
    } catch (e) {
      alert(e.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
          Login Voter
        </h2>
        <form className="space-y-4" onSubmit={submit}>
          <input
            placeholder="StudentID atau Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
            Masuk
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Contoh login: <b>1001</b> / <b>password123</b>
        </p>
      </div>
    </div>
  );
}
