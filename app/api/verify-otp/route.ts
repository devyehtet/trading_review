import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json() as { email: string; code: string };
    if (!email || !code) {
      return NextResponse.json({ error: 'email and code required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('nc_otps')
      .select('code, expires_at')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'OTP not found' }, { status: 404 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
    }

    if (data.code !== code) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // Delete used OTP
    await supabase.from('nc_otps').delete().eq('email', email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('verify-otp error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
