const nodemailer = require('nodemailer');
const { configureMailtrapTransporter } = require('./emailMailtrap');
require('dotenv').config()

const transporter = configureMailtrapTransporter();


const sendVerificationEmail = async (email, verificationToken) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `Click the following link to verify your email: <a href="http://localhost:3000/users/verify/${verificationToken}">Verify Email</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

module.exports = {
    sendVerificationEmail,
};
