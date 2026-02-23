import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from './emailTemplate.js'; // adjust path as needed

dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER); // add this temporarily
console.log("EMAIL_PASS:", process.env.EMAIL_PASS); 

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"EasyTrip" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, verificationCode) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    '{verificationCode}',
    verificationCode
  );
  await sendEmail(email, 'Verify Your Email - EasyTrip', html);
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>Your email has been verified. Welcome to EasyTrip!</p>
  `;
  await sendEmail(email, 'Welcome to EasyTrip!', html);
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL);
  await sendEmail(email, 'Reset Your Password - EasyTrip', html);
};

export const sendPasswordResetSuccessEmail = async (email) => {
  await sendEmail(
    email,
    'Password Reset Successful - EasyTrip',
    PASSWORD_RESET_SUCCESS_TEMPLATE
  );
};