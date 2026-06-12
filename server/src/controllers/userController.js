const User = require('../models/User');
const sendEmail = require('../utils/emailSender');
const logAudit = require('../utils/auditLogger');
const crypto = require('crypto');

// Generate secure random password
const generateRandomPassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  const allChars = upper + lower + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each
  password += upper[crypto.randomInt(0, upper.length)];
  password += lower[crypto.randomInt(0, lower.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Fill the rest to 12 chars
  for (let i = password.length; i < 12; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role === 'admin') {
      query.role = 'staff'; // Admin can only see staff
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -passwordHistory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ users, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, department, mobile, role } = req.body;

    if (req.user.role === 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Admins can only create staff accounts' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const password = generateRandomPassword();

    const user = await User.create({
      name,
      email,
      password,
      department,
      mobile,
      role: role || 'staff',
      createdBy: req.user._id,
      mustChangePassword: true
    });

    await logAudit(req, 'Created User', 'user', user._id.toString(), { newRole: user.role, newEmail: user.email });

    // Send Welcome Email
    if (email) {
      try {
        await sendEmail({
          email: user.email, // using the raw email, not encrypted getter directly (mongoose handles it)
          subject: `Welcome to AYUSH Technologies - Account Created`,
          message: `Dear ${name},\n\nYour account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password on first login.`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #1a3c6e;">Welcome to AYUSH Technologies</h2>
              <p>Dear <strong>${name}</strong>,</p>
              <p>An account has been created for you. Please log in using the credentials below:</p>
              <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Login Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
              </div>
              <p><strong>Note:</strong> You will be required to change your password upon your first login for security purposes.</p>
              <br/>
              <p>Best Regards,<br/><strong>AYUSH Technologies IT Admin</strong></p>
            </div>
          `
        });
      } catch (err) {
        console.error('Failed to send welcome email', err);
      }
    }

    const createdUser = await User.findById(user._id).select('-password -passwordHistory');
    res.status(201).json({ user: createdUser, tempPassword: password });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'ceo') return res.status(403).json({ message: 'Cannot deactivate CEO' });
    if (req.user.role === 'admin' && user.role !== 'staff') {
      return res.status(403).json({ message: 'Admins can only manage staff' });
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    await logAudit(req, `Updated User Status to ${user.isActive}`, 'user', user._id.toString());

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'ceo') return res.status(403).json({ message: 'Cannot reset CEO password via this route' });
    if (req.user.role === 'admin' && user.role !== 'staff') {
      return res.status(403).json({ message: 'Admins can only manage staff' });
    }

    const newPassword = generateRandomPassword();
    user.password = newPassword;
    user.mustChangePassword = true;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await logAudit(req, 'Reset User Password', 'user', user._id.toString());

    if (user.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: `AYUSH Technologies - Password Reset`,
          message: `Your password has been reset. New password: ${newPassword}`,
          html: `<p>Your password has been reset by an administrator.</p><p>New Password: <strong>${newPassword}</strong></p><p>Please log in and change your password immediately.</p>`
        });
      } catch (err) {}
    }

    res.json({ message: 'Password reset successfully', tempPassword: newPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
  resetUserPassword
};
