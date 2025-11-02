#!/usr/bin/env node

/**
 * Trackerbee Desktop Notifier
 * 
 * Polls for new tickets every 5 minutes and sends desktop notifications.
 * Run in background: node trackerbee-notifier.js &
 */

const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');

// Load from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fkgdwihxexwqldrpifcq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_KEY. Set it in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Track last check time
let lastCheckTime = new Date();

// Send macOS notification
function notify(title, message) {
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedMessage = message.replace(/"/g, '\\"');
  
  const script = `osascript -e 'display notification "${escapedMessage}" with title "${escapedTitle}" sound name "Ping"'`;
  
  exec(script, (error) => {
    if (error) console.error('Notification error:', error);
  });
}

// Check for new tickets
async function checkForNewTickets() {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, title, status, ai_suggested_priority, created_at')
      .gte('created_at', lastCheckTime.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (tickets && tickets.length > 0) {
      console.log(`🐝 Found ${tickets.length} new ticket(s)!`);
      
      // Send notification for each new ticket
      tickets.forEach(ticket => {
        const priority = ticket.ai_suggested_priority || 'medium';
        const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
        
        notify(
          `${emoji} New Trackerbee Ticket`,
          `${ticket.title}\nStatus: ${ticket.status} | Priority: ${priority}`
        );
      });

      // Summary notification
      if (tickets.length > 3) {
        notify(
          '🐝 Trackerbee Summary',
          `${tickets.length} new tickets. Open Cursor to review!`
        );
      }
    } else {
      console.log(`✓ No new tickets since ${lastCheckTime.toLocaleTimeString()}`);
    }

    // Update last check time
    lastCheckTime = new Date();

  } catch (error) {
    console.error('Error checking tickets:', error);
  }
}

// Initial check
console.log('🐝 Trackerbee Notifier started');
console.log('📍 Checking every 5 minutes for new tickets...');
checkForNewTickets();

// Poll every 5 minutes
setInterval(checkForNewTickets, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🐝 Trackerbee Notifier stopped');
  process.exit(0);
});

