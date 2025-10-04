import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's client
    const { data: client } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 });
    }

    // Get yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Fetch yesterday's data
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', client.id)
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', yesterdayEnd.toISOString());

    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', client.id)
      .gte('timestamp', yesterday.toISOString())
      .lte('timestamp', yesterdayEnd.toISOString());

    // Calculate metrics
    const totalSessions = sessions?.length || 0;
    const conversions = sessions?.filter(s => s.converted).length || 0;
    const phoneClicks = events?.filter(e => e.event_type === 'phone_click').length || 0;
    const emailClicks = events?.filter(e => e.event_type === 'email_click').length || 0;
    const formSubmits = events?.filter(e => e.event_type === 'form_submit').length || 0;
    const rageClicks = events?.filter(e => e.event_type === 'rage_click').length || 0;
    const jsErrors = events?.filter(e => e.event_type === 'js_error').length || 0;

    // Get top pages
    const pageviews = events?.filter(e => e.event_type === 'pageview') || [];
    const pageCount: Record<string, number> = {};
    pageviews.forEach(e => {
      const url = new URL(e.url).pathname;
      pageCount[url] = (pageCount[url] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Average time spent
    const exitEvents = events?.filter(e => e.event_type === 'exit') || [];
    const avgTime = exitEvents.length > 0
      ? Math.round(exitEvents.reduce((sum, e) => sum + (e.data?.time_spent || 0), 0) / exitEvents.length)
      : 0;

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
    .content { padding: 30px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
    .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 32px; font-weight: bold; color: #333; margin: 0; }
    .metric-label { font-size: 13px; color: #666; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: 600; color: #333; margin: 0 0 15px 0; }
    .page-list { list-style: none; padding: 0; margin: 0; }
    .page-item { padding: 12px 15px; background: #f8f9fa; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
    .page-url { color: #667eea; font-weight: 500; }
    .page-count { background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .alert { padding: 15px; border-radius: 6px; margin-bottom: 10px; }
    .alert-warning { background: #fff3cd; border-left: 4px solid #ffc107; }
    .alert-danger { background: #f8d7da; border-left: 4px solid #dc3545; }
    .alert-success { background: #d4edda; border-left: 4px solid #28a745; }
    .footer { padding: 30px; text-align: center; color: #999; font-size: 13px; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Analytics Digest</h1>
      <p>${yesterday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="content">
      <!-- Key Metrics -->
      <div class="metric-grid">
        <div class="metric">
          <p class="metric-value">${totalSessions}</p>
          <p class="metric-label">Sessions</p>
        </div>
        <div class="metric">
          <p class="metric-value">${conversions}</p>
          <p class="metric-label">Conversions</p>
        </div>
        <div class="metric">
          <p class="metric-value">${avgTime}s</p>
          <p class="metric-label">Avg Time</p>
        </div>
        <div class="metric">
          <p class="metric-value">${phoneClicks + emailClicks + formSubmits}</p>
          <p class="metric-label">High Intent</p>
        </div>
      </div>

      <!-- Conversion Signals -->
      ${phoneClicks + emailClicks + formSubmits > 0 ? `
      <div class="alert alert-success">
        <strong>✅ Conversion Signals Detected</strong><br>
        ${phoneClicks > 0 ? `📞 ${phoneClicks} phone click${phoneClicks !== 1 ? 's' : ''}<br>` : ''}
        ${emailClicks > 0 ? `📧 ${emailClicks} email click${emailClicks !== 1 ? 's' : ''}<br>` : ''}
        ${formSubmits > 0 ? `📝 ${formSubmits} form submit${formSubmits !== 1 ? 's' : ''}` : ''}
      </div>
      ` : ''}

      <!-- Frustration Alerts -->
      ${rageClicks + jsErrors > 0 ? `
      <div class="alert alert-danger">
        <strong>⚠️ Frustration Signals Detected</strong><br>
        ${rageClicks > 0 ? `😤 ${rageClicks} rage click${rageClicks !== 1 ? 's' : ''}<br>` : ''}
        ${jsErrors > 0 ? `🐛 ${jsErrors} JavaScript error${jsErrors !== 1 ? 's' : ''}` : ''}
      </div>
      ` : ''}

      <!-- Top Pages -->
      ${topPages.length > 0 ? `
      <div class="section">
        <h2 class="section-title">🔥 Top Pages</h2>
        <ul class="page-list">
          ${topPages.map(([url, count]) => `
            <li class="page-item">
              <span class="page-url">${url}</span>
              <span class="page-count">${count} views</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : `
      <div class="alert alert-warning">
        <strong>📭 No Activity Yesterday</strong><br>
        No sessions were recorded yesterday.
      </div>
      `}

      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/clients" class="btn">View Full Dashboard →</a>
    </div>

    <div class="footer">
      <p>You're receiving this because you have a Web Analytics account.</p>
      <p>© ${new Date().getFullYear()} Web Analytics</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Web Analytics <stephen@krezzo.com>',
      to: [user.email || ''],
      subject: `📊 Daily Digest - ${totalSessions} sessions yesterday`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      emailId: data?.id,
      metrics: {
        totalSessions,
        conversions,
        phoneClicks,
        emailClicks,
        formSubmits,
        rageClicks,
        jsErrors,
        avgTime
      }
    });

  } catch (error) {
    console.error('Send digest error:', error);
    return NextResponse.json({ 
      error: 'Failed to send digest',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

