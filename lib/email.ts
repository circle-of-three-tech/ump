import sgMail from '@sendgrid/mail';

// Configure SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.DOMAIN_URL}/auth/verify?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Verify your UniMarkets account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to UniMarkets!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
        <p>If you didn't create an account on UniMarkets, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendVerificationResultEmail(email: string, isApproved: boolean, reason?: string) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `UniMarkets Account Verification ${isApproved ? 'Approved' : 'Rejected'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Verification Update</h2>
        ${isApproved ? `
          <p>Congratulations! Your account has been verified. You now have full access to UniMarkets features.</p>
        ` : `
          <p>Your account verification request has been rejected.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          <p>Please review our verification requirements and submit a new request.</p>
        `}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="color: #6B7280; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending verification result email:', error);
    throw new Error('Failed to send verification result email');
  }
}
