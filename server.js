const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS, images, assets)
app.use(express.static(path.join(__dirname)));

// Create Nodemailer Transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'mdikaiosune@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Shared Email Handler logic
const handleEmail = async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  // Validation check
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all fields (Name, Email, Subject, Message).'
    });
  }

  // Construct Email Options
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
      message: 'Failed to send email. Make sure your EMAIL_PASS app password is correctly set.'
    });
  }
};

// Handle POST endpoints
app.post('/send-email', handleEmail);
app.post('/api/send-email', handleEmail);

// Serve index.html for all GET routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Portfolio Web Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`=================================`);
  });
}
