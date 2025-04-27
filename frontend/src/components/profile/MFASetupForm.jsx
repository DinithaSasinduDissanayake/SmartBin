import React, { useState } from 'react';
import './ProfileForms.css';

const MFASetupForm = ({ profileData, onEnableMFA, onDisableMFA, loading }) => {
  const [setupStep, setSetupStep] = useState('initial'); // 'initial', 'qrcode', 'verify', 'success'
  const [mfaData, setMfaData] = useState({
    qrCode: '',
    secret: '',
    token: '',
    password: '',
    recoveryCodes: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset states when canceling setup
  const handleCancel = () => {
    setSetupStep('initial');
    setMfaData({
      qrCode: '',
      secret: '',
      token: '',
      password: '',
      recoveryCodes: []
    });
    setError('');
  };

  // Handle text input changes
  const handleChange = (e) => {
    setMfaData({ ...mfaData, [e.target.name]: e.target.value });
    setError('');
  };

  // Start the MFA setup process - generate QR code
  const handleStartSetup = async () => {
    try {
      setError('');
      
      // Call API to generate secret and QR code
      const response = await onEnableMFA.generateSecret();
      
      if (response.success) {
        setMfaData({
          ...mfaData,
          qrCode: response.data.data.qrCode,
          secret: response.data.data.secret
        });
        setSetupStep('qrcode');
      } else {
        setError('Failed to generate MFA setup information');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while setting up MFA');
      console.error('MFA setup error:', err);
    }
  };

  // Verify the token and complete MFA setup
  const handleVerifyToken = async () => {
    if (!mfaData.token) {
      setError('Please enter the verification code from your authenticator app');
      return;
    }

    try {
      setError('');
      
      // Call API to verify token and enable MFA
      const response = await onEnableMFA.enableMFA({
        token: mfaData.token,
        secret: mfaData.secret
      });
      
      if (response.success) {
        // Save recovery codes and move to success step
        setMfaData({
          ...mfaData,
          recoveryCodes: response.data.recoveryCodes || []
        });
        setSuccess('MFA has been successfully enabled for your account');
        setSetupStep('success');
      } else {
        setError('Failed to verify the code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
      console.error('MFA verification error:', err);
    }
  };

  // Disable MFA
  const handleDisableMFA = async () => {
    if (!mfaData.password) {
      setError('Please enter your password to disable MFA');
      return;
    }

    try {
      setError('');
      
      // Call API to disable MFA
      const response = await onDisableMFA({ password: mfaData.password });
      
      if (response.success) {
        setSuccess('MFA has been disabled for your account');
        setMfaData({
          qrCode: '',
          secret: '',
          token: '',
          password: '',
          recoveryCodes: []
        });
        setSetupStep('initial');
      } else {
        setError('Failed to disable MFA');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while disabling MFA');
      console.error('MFA disable error:', err);
    }
  };

  // Download recovery codes as a text file
  const handleDownloadCodes = () => {
    if (mfaData.recoveryCodes.length === 0) {
      setError('No recovery codes available to download');
      return;
    }

    const codesText = mfaData.recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartbin-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="profile-form-container">
      <h3>Two-Factor Authentication (2FA)</h3>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="mfa-status">
        <span className={`status-indicator ${profileData?.mfaEnabled ? 'enabled' : 'disabled'}`}>
          {profileData?.mfaEnabled ? 'Enabled' : 'Disabled'}
        </span>
        <p>
          Two-factor authentication adds an extra layer of security to your account by requiring 
          both your password and access to your mobile device.
        </p>
      </div>

      {setupStep === 'initial' && (
        <div className="setup-initial">
          {profileData?.mfaEnabled ? (
            <div className="mfa-disable-form">
              <p>To disable two-factor authentication, please confirm your password:</p>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={mfaData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="mfa-button warning"
                  onClick={handleDisableMFA}
                  disabled={loading || !mfaData.password}
                >
                  {loading ? 'Processing...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>Follow these steps to enable two-factor authentication:</p>
              <ol>
                <li>Install an authenticator app on your device (Google Authenticator, Microsoft Authenticator, Authy, etc.)</li>
                <li>Scan the QR code with the app or enter the setup key manually</li>
                <li>Enter the verification code shown in your app</li>
                <li>Save your recovery codes in a safe place</li>
              </ol>
              <button
                className="mfa-button"
                onClick={handleStartSetup}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Set Up Two-Factor Authentication'}
              </button>
            </>
          )}
        </div>
      )}

      {setupStep === 'qrcode' && (
        <div className="qr-code-step">
          <p>Scan this QR code with your authenticator app:</p>
          
          <div className="qr-code-container">
            <img src={mfaData.qrCode} alt="QR Code for authenticator app" />
          </div>
          
          <p>Or set up manually with this code:</p>
          <code className="manual-code">{mfaData.secret}</code>
          
          <div className="form-group">
            <label htmlFor="token">Enter the 6-digit verification code from your app:</label>
            <input
              type="text"
              id="token"
              name="token"
              value={mfaData.token}
              onChange={handleChange}
              disabled={loading}
              placeholder="123456"
              autoComplete="off"
              maxLength={6}
            />
          </div>
          
          <div className="form-buttons">
            <button
              className="mfa-button"
              onClick={handleVerifyToken}
              disabled={loading || mfaData.token.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
            <button
              className="mfa-button secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {setupStep === 'success' && (
        <div className="recovery-codes">
          <h5>Important: Save Your Recovery Codes</h5>
          <p>
            Recovery codes can be used to access your account if you lose your device.
            Each code can only be used once. Keep these codes in a safe place!
          </p>
          
          <div className="codes-container">
            {mfaData.recoveryCodes.map((code, index) => (
              <div key={index} className="recovery-code">
                {code}
              </div>
            ))}
          </div>
          
          <div className="form-buttons">
            <button
              className="mfa-button"
              onClick={handleDownloadCodes}
            >
              Download Recovery Codes
            </button>
            <button
              className="mfa-button secondary"
              onClick={() => setSetupStep('initial')}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MFASetupForm;