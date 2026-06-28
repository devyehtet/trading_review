import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json() as { email: string; name: string };

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from:    'NexoraCapi <onboarding@resend.dev>',
      to:      email,
      subject: '🎉 Your NexoraCapi Account is Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f1117; color: #e2e8f0; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a5f, #0f2540); padding: 32px 32px 24px; text-align: center;">
            <div style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">
              <span style="color: #3b82f6;">nexora</span><span style="color: #10d9a0;">capi</span>
            </div>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Connect · Automate · Grow</div>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">✅</div>
              <h2 style="color: #10d9a0; margin: 12px 0 8px; font-size: 22px;">Account Verified!</h2>
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">Your KYC application has been approved</p>
            </div>

            <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              Dear <strong style="color: #f1f5f9;">${name || 'Applicant'}</strong>,
            </p>
            <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              We are pleased to inform you that your identity verification (KYC) has been <strong style="color: #10d9a0;">successfully approved</strong>.
              Your NexoraCapi account is now fully activated and you can start investing.
            </p>

            <!-- CTA -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://trading-review-eight.vercel.app"
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: #ffffff; text-decoration: none; padding: 14px 32px;
                        border-radius: 10px; font-weight: 700; font-size: 15px;">
                Login to Your Account →
              </a>
            </div>

            <!-- Info box -->
            <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3);
                        border-radius: 10px; padding: 16px; margin-top: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 13px; line-height: 1.6;">
                ℹ️ You can now access all features including deposits, withdrawals, investment plans, and gold trading.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 32px; border-top: 1px solid #1e293b; text-align: center;">
            <p style="color: #475569; font-size: 11px; margin: 0;">
              © 2025 NexoraCapi · This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('kyc-approved route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
