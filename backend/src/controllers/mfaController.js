// backend/src/controllers/mfaController.js
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ApiError, BadRequestError, UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');
const config = require('../config');
/**
 * Generate a new MFA secret for a user
 * @route POST /api/mfa/generate
 * @access Private
 */
exports.generateMfaSecret = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if MFA is already enabled
    const user = await User.findById(userId);
    if (user.mfaEnabled) {
      throw new BadRequestError('MFA is already enabled for this account');
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `SmartBin:${user.email}` // This will show in the authenticator app
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily in the session or as a temporary field
    // In a real production app, you might want to store this in Redis or similar
    // with a short TTL, but for simplicity, we'll just return it and expect it back
    
    return res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        secret: secret.base32 // This needs to be saved by the client and sent back
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new BadRequestError('Failed to generate MFA secret');
  }
};

/**
 * Enable MFA for a user after verifying the token
 * @route POST /api/mfa/enable
 * @access Private
 */
exports.enableMfa = async (req, res) => {
  try {
    const { token, secret } = req.body;
    const userId = req.user.id;

    if (!token || !secret) {
      throw new BadRequestError('Token and secret are required');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // Generate recovery codes
    const recoveryCodes = [];
    for (let i = 0; i < 10; i++) {
      // Generate a random recovery code
      const code = Math.random().toString(36).substring(2, 12).toUpperCase();
      
      // Hash the code for storage
      const salt = await bcrypt.genSalt(10);
      const hashedCode = await bcrypt.hash(code, salt);
      
      recoveryCodes.push({ original: code, hashed: hashedCode });
    }

    // Enable MFA for the user
    await User.findByIdAndUpdate(userId, {
      mfaEnabled: true,
      mfaSecret: secret,
      mfaRecoveryCodes: recoveryCodes.map(code => code.hashed)
    });

    // Return the recovery codes to the user (only once)
    return res.status(200).json({
      success: true,
      message: 'MFA enabled successfully',
      recoveryCodes: recoveryCodes.map(code => code.original) // Only send the unhashed codes
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new BadRequestError('Failed to enable MFA');
  }
};

/**
 * Verify a token during login process
 * @route POST /api/mfa/verify
 * @access Public (Used during authentication)
 */
exports.verifyMfaToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      throw new BadRequestError('User ID and token are required');
    }

    // Get the user with MFA secret
    const user = await User.findById(userId).select('+mfaSecret');
    if (!user) {
      throw new UnauthorizedError('Invalid user ID');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 time step before/after for clock drift
    });

    if (!verified) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    return res.status(200).json({
      success: true,
      token: jwtToken,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new BadRequestError('Failed to verify MFA token');
  }
};

/**
 * Use a recovery code when MFA device is not available
 * @route POST /api/mfa/recover
 * @access Public (Used during authentication)
 */
exports.verifyRecoveryCode = async (req, res) => {
  try {
    const { userId, recoveryCode } = req.body;

    if (!userId || !recoveryCode) {
      throw new BadRequestError('User ID and recovery code are required');
    }

    // Get the user with recovery codes
    const user = await User.findById(userId).select('+mfaRecoveryCodes');
    if (!user) {
      throw new UnauthorizedError('Invalid user ID');
    }

    // Check if the recovery code matches any of the stored codes
    let matchFound = false;
    let matchedCodeIndex = -1;

    for (let i = 0; i < user.mfaRecoveryCodes.length; i++) {
      const isMatch = await bcrypt.compare(recoveryCode, user.mfaRecoveryCodes[i]);
      if (isMatch) {
        matchFound = true;
        matchedCodeIndex = i;
        break;
      }
    }

    if (!matchFound) {
      throw new UnauthorizedError('Invalid recovery code');
    }

    // Remove the used recovery code
    user.mfaRecoveryCodes.splice(matchedCodeIndex, 1);
    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    return res.status(200).json({
      success: true,
      token: jwtToken,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new BadRequestError('Failed to verify recovery code');
  }
};

/**
 * Disable MFA for a user
 * @route POST /api/mfa/disable
 * @access Private
 */
exports.disableMfa = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      throw new BadRequestError('Password is required to disable MFA');
    }

    // Get the user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid password');
    }

    // Disable MFA
    await User.findByIdAndUpdate(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaRecoveryCodes: []
    });

    return res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new BadRequestError('Failed to disable MFA');
  }
};