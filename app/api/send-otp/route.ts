import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend  = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json() as { email: string; name?: string };
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Save/update in Supabase
    const { error: dbErr } = await supabase
      .from('nc_otps')
      .upsert({ email, code, expires_at: expiresAt }, { onConflict: 'email' });

    if (dbErr) {
      console.error('OTP save error:', dbErr.message);
      return NextResponse.json({ error: 'Failed to save OTP' }, { status: 500 });
    }

    // Send email
    const { error: mailErr } = await resend.emails.send({
      from:    'NexoraCapi <onboarding@resend.dev>',
      to:      email,
      subject: `${code} — Your NexoraCapi Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;
                    background: #0f1117; color: #e2e8f0; border-radius: 16px; overflow: hidden;">

          <div style="background: linear-gradient(135deg, #1e3a5f, #0f2540); padding: 28px 32px 20px; text-align: center;">
            <div style="font-size: 26px; font-weight: 900;">
              <span style="color: #3b82f6;">nexora</span><span style="color: #10d9a0;">capi</span>
            </div>
            <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">Connect · Automate · Grow</div>
          </div>

          <div style="padding: 32px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px;">
              Hi <strong style="color: #f1f5f9;">${name || email}</strong>, your verification code is:
            </p>

            <!-- OTP Code -->
            <div style="background: rgba(59,130,246,0.12); border: 2px solid rgba(59,130,246,0.4);
                        border-radius: 14px; padding: 20px; margin: 20px 0; display: inline-block; width: 100%; box-sizing: border-box;">
              <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #60a5fa;
                          font-family: 'Courier New', monospace;">${code}</div>
            </div>

            <p style="color: #64748b; font-size: 12px; margin: 0 0 20px;">
              ⏱ This code expires in <strong style="color: #fbbf24;">10 minutes</strong>
            </p>

            <div style="background: rgba(255,100,117,0.08); border: 1px solid rgba(255,100,117,0.25);
                        border-radius: 8px; padding: 12px; text-align: left;">
              <p style="color: #fca5a5; font-size: 12px; margin: 0;">
                🔒 Never share this code with anyone. NexoraCapi staff will never ask for your OTP.
              </p>
            </div>
          </div>

          <div style="padding: 16px 32px; border-top: 1px solid #1e293b; text-align: center;">
            <p style="color: #475569; font-size: 11px; margin: 0;">
              © 2025 NexoraCapi · If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (mailErr) {
      console.error('Resend error:', mailErr);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
