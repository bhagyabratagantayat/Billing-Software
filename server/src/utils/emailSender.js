const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 resolution to prevent ENETUNREACH errors on Render/VPS
dns.setDefaultResultOrder('ipv4first');

let workingTransporter = null;

const createConfig = (configName, options) => ({
  name: configName,
  options: {
    ...options,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,
    socketTimeout: 20000,
  }
});

// List of SMTP configurations to test automatically
const smtpConfigs = [
  createConfig('Brevo Port 2525 (Render Safe)', {
    host: 'smtp-relay.brevo.com',
    port: 2525,
    secure: false,
    tls: { rejectUnauthorized: false }
  }),
  createConfig('Brevo Port 587 (STARTTLS)', {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    tls: { rejectUnauthorized: false }
  }),
  createConfig('Brevo Port 465 (Secure)', {
    host: 'smtp-relay.brevo.com',
    port: 465,
    secure: true,
    tls: { rejectUnauthorized: false }
  })
];

const initializeTransporter = async () => {
  if (workingTransporter) return workingTransporter;

  console.log('\n🔄 Initializing Nodemailer: Auto-discovering working SMTP configuration...');

  for (const config of smtpConfigs) {
    try {
      console.log(`⏳ Testing SMTP Method: ${config.name}...`);
      const transporter = nodemailer.createTransport(config.options);
      
      // Verify connection
      await transporter.verify();
      
      console.log(`✅ SMTP Method [${config.name}] Working!`);
      console.log('✅ Selected SMTP Configuration\n');
      workingTransporter = transporter;
      return workingTransporter;
    } catch (error) {
      console.error(`❌ SMTP Method [${config.name}] Failed: ${error.message}`);
    }
  }

  console.error('\n🚨 All SMTP configurations failed. Email service is unavailable.\n');
  return null;
};

// Start discovery immediately when the server starts
initializeTransporter();

const sendEmail = async (options, retries = 3) => {
  const transporter = await initializeTransporter();
  
  if (!transporter) {
    throw new Error('Email service is not configured correctly or unreachable.');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `AYUSH Technologies <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Email sent successfully to ${options.email} (Message ID: ${info.messageId})`);
      return info;
    } catch (error) {
      console.error(`⚠️ Email send attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw new Error(`Failed to send email after ${retries} attempts: ${error.message}`);
      }
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = sendEmail;
