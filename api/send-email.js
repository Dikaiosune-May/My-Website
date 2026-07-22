const nodemailer = require('nodemailer');

/**
 * Vercel Serverless Function: /api/send-email
 * Handles contact form submissions and dispatches email via Nodemailer (Gmail).
 */
module.exports = async function handler(req, res) {
  // 1. Set CORS Headers for all incoming requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle Preflight OPTIONS request immediately before any method checks
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Enforce POST Method
  if (req.method !== 'POST') {
    console.warn(`[405] Method Not Allowed: ${req.method}`);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed. Only POST is supported.`
    });
  }

  // 4. Top-level Try-Catch block to prevent unhandled function crashes
  try {
    // Parse request body safely (handles raw strings or parsed JSON objects)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        console.error('❌ JSON Parsing Error:', parseErr.message);
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON payload sent in request body.'
        });
      }
    }

    const { name, email, subject, message } = body || {};

    // Validate presence of required input fields
    if (!name || !email || !subject || !message) {
      console.warn('⚠️ Validation Error - Missing fields:', { name: !!name, email: !!email, subject: !!subject, message: !!message });
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Name, Email, Subject, Message).'
      });
    }

    // Retrieve environment variables
    const emailUser = process.env.EMAIL_USER || 'mdikaiosune@gmail.com';
    const emailPass = process.env.EMAIL_PASS;

    // Verify SMTP password configuration
    if (!emailPass) {
      console.error('❌ Configuration Error: Missing EMAIL_PASS environment variable in Vercel settings.');
      return res.status(500).json({
        success: false,
        message: 'Server Configuration Error: EMAIL_PASS is not configured in Vercel Environment Variables.'
      });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Build email payload
    const sanitizeHeader = (str) => String(str).replace(/[\r\n]/g, '');
    const mailOptions = {
      from: `"${sanitizeHeader(name)}" <${emailUser}>`,
      to: 'mdikaiosune@gmail.com',
      replyTo: sanitizeHeader(email),
      subject: `Portfolio Inquiry: ${sanitizeHeader(subject)}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-top: 0;">New Contact Form Submission</h2>
          <p style="margin: 8px 0;"><strong>Sender Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #06b6d4;">${email}</a></p>
          <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 16px 0 8px 0;"><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #06b6d4; border-radius: 6px; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.5;">${message}</div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent from "${name}" <${email}>`);

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!'
    });

  } catch (error) {
    console.error('❌ Serverless Execution Exception:', error.stack || error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An internal error occurred while sending the message.'
    });
  }
};
