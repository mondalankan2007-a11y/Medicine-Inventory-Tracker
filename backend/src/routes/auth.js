const nodemailer = require('nodemailer');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ── In-memory OTP store: { email -> { otp, expiresAt } }
const otpStore = new Map();

// ── Create Ethereal test transport (auto-creates a free test account)
let transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('\n📧 Ethereal test email account created:');
  console.log('   User:', testAccount.user);
  console.log('   Pass:', testAccount.pass);
  return transporter;
}

// ── REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: { name, email, password_hash, role: role || 'pharmacist' }
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── FORGOT PASSWORD — generate & send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Security: don't reveal if email exists
      return res.json({ message: 'If that email is registered, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiresAt });

    // Send email via Ethereal
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"PharmaTrack" <noreply@pharmatrack.app>',
      to: email,
      subject: 'Your PharmaTrack Password Reset OTP',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #e2e8f0">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="color:#1e293b;margin:0">PharmaTrack</h2>
            <p style="color:#64748b;margin:4px 0 0">Password Reset</p>
          </div>
          <p style="color:#374151;margin-bottom:8px">Hi <strong>${user.name}</strong>,</p>
          <p style="color:#374151">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="text-align:center;margin:32px 0">
            <div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;border-radius:12px;padding:16px 40px">
              <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#2563eb;font-family:monospace">${otp}</span>
            </div>
          </div>
          <p style="color:#6b7280;font-size:13px">If you didn't request this, please ignore this email. Your password won't change.</p>
        </div>
      `,
    });

    // Print preview link to terminal (Ethereal only)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\n✅ OTP email sent for:', email);
    console.log('   OTP (dev):', otp);
    console.log('   Preview URL:', previewUrl, '\n');

    res.json({ message: 'If that email is registered, an OTP has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// ── VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

    // Mark as verified — generate a short-lived reset token
    const resetToken = jwt.sign({ email, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    otpStore.delete(email); // consume OTP
    res.json({ message: 'OTP verified', resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Reset link has expired. Please start over.' });
    }
    if (payload.purpose !== 'reset') return res.status(400).json({ error: 'Invalid reset token.' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { email: payload.email },
      data: { password_hash }
    });

    res.json({ message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
