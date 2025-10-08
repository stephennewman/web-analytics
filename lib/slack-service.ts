import { WebClient } from '@slack/web-api';

interface SlackIntegration {
  id: string;
  user_id: string;
  workspace_id: string;
  workspace_name: string;
  channel_id: string;
  channel_name: string;
  bot_token: string;
  is_active: boolean;
  alert_preferences: {
    conversions: boolean;
    high_intent: boolean;
    frustration: boolean;
    errors: boolean;
    daily_digest: boolean;
    per_client: boolean;
  };
}

interface SlackMessage {
  text: string;
  blocks?: any[];
  attachments?: any[];
}

export class SlackService {
  private client: WebClient;

  constructor(botToken: string) {
    this.client = new WebClient(botToken);
  }

  async sendMessage(channelId: string, message: SlackMessage): Promise<boolean> {
    try {
      // Ensure channel starts with # if it's a channel name
      const channel = channelId.startsWith('#') ? channelId : `#${channelId}`;
      
      const result = await this.client.chat.postMessage({
        channel: channel,
        text: message.text,
        blocks: message.blocks,
        attachments: message.attachments,
      });

      return result.ok || false;
    } catch (error) {
      console.error('Slack API error:', error);
      return false;
    }
  }

  static formatConversionAlert(siteName: string, sessionData: any): SlackMessage {
    return {
      text: `🎉 Conversion on ${siteName}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🎉 Conversion Alert*\n*Site:* ${siteName}\n*Time:* ${new Date().toLocaleString()}\n*Session:* ${sessionData.session_id?.substring(0, 8)}...`
          }
        }
      ]
    };
  }

  static formatHighIntentAlert(siteName: string, eventType: string, sessionData: any): SlackMessage {
    const emoji = eventType === 'phone_click' ? '📞' : 
                  eventType === 'email_click' ? '📧' : 
                  eventType === 'form_submit' ? '📝' : '🎯';
    
    return {
      text: `${emoji} High Intent Signal on ${siteName}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${emoji} High Intent Signal*\n*Site:* ${siteName}\n*Action:* ${eventType.replace('_', ' ')}\n*Time:* ${new Date().toLocaleString()}`
          }
        }
      ]
    };
  }

  static formatFrustrationAlert(siteName: string, eventType: string, sessionData: any): SlackMessage {
    const emoji = eventType === 'rage_click' ? '😤' : '🐛';
    const description = eventType === 'rage_click' ? 'Rage clicks detected' : 'JavaScript errors detected';
    
    return {
      text: `⚠️ ${description} on ${siteName}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*⚠️ Frustration Alert*\n*Site:* ${siteName}\n*Issue:* ${description}\n*Time:* ${new Date().toLocaleString()}`
          }
        }
      ]
    };
  }

  static formatDailyDigest(siteName: string, metrics: any): SlackMessage {
    const {
      totalSessions,
      conversions,
      phoneClicks,
      emailClicks,
      formSubmits,
      rageClicks,
      jsErrors,
      avgTime,
      topPages
    } = metrics;

    const conversionRate = totalSessions > 0 ? ((conversions / totalSessions) * 100).toFixed(1) : '0.0';
    const highIntent = phoneClicks + emailClicks + formSubmits;

    return {
      text: `📊 Daily Digest - ${siteName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 Daily Analytics Digest - ${siteName}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Sessions*\n${totalSessions}`
            },
            {
              type: 'mrkdwn',
              text: `*Conversions*\n${conversions} (${conversionRate}%)`
            },
            {
              type: 'mrkdwn',
              text: `*High Intent*\n${highIntent} signals`
            },
            {
              type: 'mrkdwn',
              text: `*Avg Time*\n${avgTime}s`
            }
          ]
        },
        ...(highIntent > 0 ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Conversion Signals:* ${phoneClicks} phone clicks, ${emailClicks} email clicks, ${formSubmits} form submits`
          }
        }] : []),
        ...(rageClicks + jsErrors > 0 ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⚠️ *Issues:* ${rageClicks} rage clicks, ${jsErrors} JS errors`
          }
        }] : []),
        ...(topPages && topPages.length > 0 ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🔥 *Top Pages:*\n${topPages.slice(0, 3).map(([url, count]: [string, number]) => `• ${url} (${count} views)`).join('\n')}`
          }
        }] : [])
      ]
    };
  }
}
