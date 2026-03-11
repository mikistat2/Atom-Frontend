import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // Parse token and email from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      const res = await api.post('/auth/verify-email', { email, token });
      setStatus(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleVerify} className="bg-surface p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Verify Your Email</h2>
        {status && <div className="bg-success/10 text-success p-3 rounded mb-3">{status}</div>}
        {error && <div className="bg-error/10 text-error p-3 rounded mb-3">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-2">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-2">Verification Token</label>
          <input type="text" value={token} onChange={e => setToken(e.target.value)} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-semibold">Verify Email</button>
      </form>
    </div>
  );
};

export default VerifyEmail;
