import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pill, ArrowLeft, CheckCircle, Mail, KeyRound, Eye, EyeOff, RefreshCw } from 'lucide-react';

// ── Step 1: Email input
const StepEmail = ({ onNext, loading, error }) => {
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onNext(email); };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex bg-blue-100 p-4 rounded-full mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Forgot your password?</h2>
        <p className="text-slate-500 text-sm mt-2">
          Enter your registered email and we'll send you a 6-digit OTP.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@pharmacy.com"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
};

// ── Step 2: OTP boxes
const StepOTP = ({ email, onNext, onResend, loading, error }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(otp.join(''));
  };

  const handleResend = async () => {
    setResendCountdown(60);
    onResend(email);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex bg-purple-100 p-4 rounded-full mb-4">
          <KeyRound className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Enter the OTP</h2>
        <p className="text-slate-500 text-sm mt-2">
          We've sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
          <br /><span className="text-xs text-slate-400">(Check the terminal / email preview link)</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                digit
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-900 focus:border-blue-400'
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {resendCountdown > 0 ? (
          <>Resend OTP in <span className="font-semibold text-slate-700">{resendCountdown}s</span></>
        ) : (
          <button
            onClick={handleResend}
            className="flex items-center space-x-1 mx-auto text-blue-600 font-semibold hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Resend OTP</span>
          </button>
        )}
      </p>
    </div>
  );
};

// ── Step 3: New password
const StepReset = ({ onNext, loading, error }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setLocalError('Passwords do not match.'); return; }
    setLocalError('');
    onNext(password);
  };

  const displayError = localError || error;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex bg-emerald-100 p-4 rounded-full mb-4">
          <KeyRound className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Set new password</h2>
        <p className="text-slate-500 text-sm mt-2">Choose a strong password for your account.</p>
      </div>

      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{displayError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

// ── Step 4: Success
const StepSuccess = ({ navigate }) => (
  <div className="flex flex-col items-center py-6 text-center space-y-4">
    <div className="bg-emerald-100 p-5 rounded-full">
      <CheckCircle className="h-12 w-12 text-emerald-600" />
    </div>
    <h2 className="text-2xl font-extrabold text-slate-900">Password Reset!</h2>
    <p className="text-slate-500 text-sm max-w-xs">
      Your password has been successfully updated. You can now log in with your new password.
    </p>
    <button
      onClick={() => navigate('/login')}
      className="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
    >
      Go to Login
    </button>
  </div>
);

// ── STEP INDICATOR
const StepDot = ({ active, done }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${done ? 'bg-blue-600' : active ? 'bg-blue-600' : 'bg-slate-200'}`} />
);

// ── MAIN COMPONENT
const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new pw, 4 = success
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendOTP = async (emailVal) => {
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:5005/api/auth/forgot-password', { email: emailVal });
      setEmail(emailVal);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (otp) => {
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5005/api/auth/verify-otp', { email, otp });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed.');
    } finally { setLoading(false); }
  };

  const resetPassword = async (newPassword) => {
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:5005/api/auth/reset-password', { resetToken, newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">PharmaTrack</span>
        </Link>
        <Link to="/login" className="flex items-center space-x-1 text-sm text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          {step < 4 && (
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[1, 2, 3].map(s => (
                <StepDot key={s} active={step === s} done={step > s} />
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            {step === 1 && <StepEmail onNext={sendOTP} loading={loading} error={error} />}
            {step === 2 && <StepOTP email={email} onNext={verifyOTP} onResend={sendOTP} loading={loading} error={error} />}
            {step === 3 && <StepReset onNext={resetPassword} loading={loading} error={error} />}
            {step === 4 && <StepSuccess navigate={navigate} />}
          </div>

          {step < 4 && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
