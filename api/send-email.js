const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name, email, subject, message } = req.body || {};

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all fields (Name, Email, Subject, Message).'
    });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'mdikaiosune@gmail.com',
      pass: process.env.EMAIL_PASS
    }
  });

  // Email to you
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER || 'mdikaiosune@gmail.com'}>`,
    to: 'mdikaiosune@gmail.com',
    replyTo: email,
    subject: `Portfolio Inquiry: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px;">New Contact Form Message</h2>
        <p><strong>Sender Name:</strong> ${name}</p>
        <p><strong>Sender Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #0284c7; border-radius: 4px; white-space: pre-wrap;">${message}</div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully from ${name} (${email})`);
    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.'
    });
  }
};
