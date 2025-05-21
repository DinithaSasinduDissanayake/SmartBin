import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Enum for supported email providers
enum EmailProvider {
  GMAIL = 'gmail',
  SENDGRID = 'sendgrid',
  SMTP = 'smtp'
}

// Determine which email provider to use based on environment variables
const getEmailProvider = (): EmailProvider => {
  if (process.env.SENDGRID_API_KEY) {
    return EmailProvider.SENDGRID;
  } else if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return EmailProvider.GMAIL;
  } else if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return EmailProvider.SMTP;
  }
  
  // Default to Gmail if configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return EmailProvider.GMAIL;
  }
  
  throw new Error('No email configuration found. Please set up email provider details in environment variables.');
};

// Create appropriate transporter based on configuration
const createTransporter = () => {
  const provider = getEmailProvider();
  
  switch (provider) {
    case EmailProvider.GMAIL:
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    
    case EmailProvider.SMTP:
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
      });
      
    default:
      // For SendGrid, return null as we'll use the SDK directly
      return null;
  }
};

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const provider = getEmailProvider();
    
    if (provider === EmailProvider.SENDGRID) {
      // Use SendGrid SDK
      const msg = {
        to,
        from: process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL || 'noreply@smartbin.app',
        subject,
        text,
        html: html || text,
      };
      
      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid');
      return;
    }
    
    // Use Nodemailer for other providers
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Could not create email transporter');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smartbin.app',
      to,
      subject,
      text,
      html: html || text,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Nodemailer');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};