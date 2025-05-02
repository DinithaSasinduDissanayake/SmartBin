// frontend/src/services/mfaApi.js
import api from './api';

/**
 * Generate MFA Secret
 * @returns {Promise<Object>} Response with QR code and secret
 */
const generateSecret = async () => {
  return await api.post('/mfa/generate');
};

/**
 * Enable MFA
 * @param {string} token - Verification token from authenticator app
 * @param {string} secret - Secret generated from generateSecret
 * @returns {Promise<Object>} Response with recovery codes
 */
const enableMFA = async (token, secret) => {
  return await api.post('/mfa/enable', { token, secret });
};

/**
 * Disable MFA
 * @param {string} password - User's current password for verification
 * @returns {Promise<Object>} Success message
 */
const disableMFA = async (password) => {
  return await api.post('/mfa/disable', { password });
};

/**
 * Verify MFA token during login
 * @param {string} userId - User's ID (received during login)
 * @param {string} token - Verification token from authenticator app
 * @returns {Promise<Object>} Response with user data and JWT token
 */
const verifyMFA = async (userId, token) => {
  return await api.post('/mfa/verify', { userId, token });
};

/**
 * Use recovery code when MFA device is not available
 * @param {string} userId - User's ID (received during login)
 * @param {string} recoveryCode - Recovery code from saved codes
 * @returns {Promise<Object>} Response with user data and JWT token
 */
const useRecoveryCode = async (userId, recoveryCode) => {
  return await api.post('/mfa/recover', { userId, recoveryCode });
};

const mfaApi = {
  generateSecret,
  enableMFA,
  disableMFA,
  verifyMFA,
  useRecoveryCode
};

export default mfaApi;