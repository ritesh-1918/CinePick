const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if email config exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email configuration missing. Skipping email send.');
        return;
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail', // Default to gmail if service not specified but user/pass are
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Select Template based on type
    let subject = options.subject;
    let htmlContent = '';

    const commonStyles = `
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #E50914; color: #ffffff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 30px; text-align: center; }
        .otp-box { background-color: #f8f9fa; border: 2px dashed #E50914; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E50914; display: inline-block; }
        .btn { display: inline-block; background-color: #E50914; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #333; color: #888; padding: 15px; text-align: center; font-size: 12px; }
        .footer p { margin: 5px 0; }
    `;

    const header = `
        <div class="header">
            <h1>CinePick</h1>
        </div>
    `;

    const footer = `
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} CinePick. All rights reserved.</p>
            <p>Discover movies you'll love.</p>
        </div>
    `;

    if (options.type === 'WELCOME') {
        subject = 'Welcome to CinePick!';
        htmlContent = `
            <div class="content">
                <h2>Welcome to CinePick!</h2>
                <p>Hello ${options.name || 'Movie Buff'},</p>
                <p>We're thrilled to have you on board! Get ready to discover your next favorite movie.</p>
                <p>Start exploring now and create your personalized watchlist.</p>
                <a href="${process.env.CLIENT_URL || '#'}" class="btn">Start Exploring</a>
            </div>
        `;
    } else if (options.type === 'PASSWORD_RESET') {
        subject = 'Password Reset Token'; // Default subject if not provided
        htmlContent = `
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your CinePick account. Use the One-Time Password (OTP) below to proceed:</p>
                
                <div class="otp-box">
                    ${options.otp}
                </div>
                
                <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
            </div>
        `;
    } else {
        // Fallback or generic email
        htmlContent = `
            <div class="content">
                <p>${options.message || 'Notification from CinePick'}</p>
            </div>
        `;
    }

    // Construct full HTML
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            ${commonStyles}
        </style>
    </head>
    <body>
        <div class="container">
            ${header}
            ${htmlContent}
            ${footer}
        </div>
    </body>
    </html>
    `;

    // Define email options
    const mailOptions = {
        from: `CinePick <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: subject,
        html: htmlTemplate
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
