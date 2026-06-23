import dotenv from 'dotenv';
import { sendOTPEmail, sendDonationOTPEmail } from './services/emailService.js';

dotenv.config();

console.log('Testing with MAIL_USER:', process.env.MAIL_USER);

async function runTest() {
  try {
    console.log('Sending student OTP email...');
    await sendOTPEmail('trannhutthien012345@gmail.com', 'Test Student', '123456', 'test-uuid-student-123');
    console.log('Student OTP email sent successfully!');

    console.log('Sending donor OTP email...');
    await sendDonationOTPEmail('trannhutthien012345@gmail.com', 'Test Donor', '654321', 'test-uuid-donor-123');
    console.log('Donor OTP email sent successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

runTest();
