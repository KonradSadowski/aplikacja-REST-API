const nodemailer = require('nodemailer');
require('dotenv').config()

const configureMailtrapTransporter = () => {
    return nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

module.exports = {
    configureMailtrapTransporter,
};