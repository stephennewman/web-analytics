'use client';

import { useState, useEffect } from 'react';

interface SlackIntegration {
  id: string;
  workspace_name: string;
  channel_name: string;
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

export default function SlackSettings() {
  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  useEffect(() => {
    fetchSlackStatus();
  }, []);

  const fetchSlackStatus = async () => {
    try {
      const response = await fetch('/api/slack/status');
      const data = await response.json();
      
      if (data.connected && data.integration) {
        setIntegration(data.integration);
      }
    } catch (error) {
      console.error('Error fetching Slack status:', error);
      setError('Failed to fetch Slack status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    setLoadingChannels(true);
    try {
      const response = await fetch('/api/slack/channels');
      const data = await response.json();
      
      if (data.channels) {
        setChannels(data.channels);
      } else {
        setError(data.error || 'Failed to fetch channels');
      }
    } catch (error) {
      setError('Failed to fetch channels');
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError('');

    // For now, we'll use a simple form. In production, this would be OAuth
    const workspaceName = prompt('Enter your Slack workspace name:');
    const channelName = prompt('Enter the channel name (without #, e.g., general):');
    const botToken = prompt('Enter your Slack bot token (xoxb-...):');

    if (!workspaceName || !channelName || !botToken) {
      setError('All fields are required');
      setConnecting(false);
      return;
    }

    try {
      const response = await fetch('/api/slack/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'temp',
          workspace_name: workspaceName,
          channel_id: 'temp', // We'll use channel name instead
          channel_name: channelName,
          bot_token: botToken
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchSlackStatus();
      } else {
        setError(data.error || 'Failed to connect Slack');
      }
    } catch (error) {
      console.error('Connect error:', error);
      setError('Failed to connect Slack: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Slack?')) return;

    try {
      const response = await fetch('/api/slack/disconnect', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setIntegration(null);
      } else {
        setError(data.error || 'Failed to disconnect Slack');
      }
    } catch (error) {
      setError('Failed to disconnect Slack');
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!integration) return;

    setUpdating(true);
    try {
      const updatedPreferences = {
        ...integration.alert_preferences,
        [key]: value
      };

      // In a real implementation, you'd have an update endpoint
      // For now, we'll just update the local state
      setIntegration({
        ...integration,
        alert_preferences: updatedPreferences
      });
    } catch (error) {
      setError('Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  const handleTestMessage = async () => {
    if (!integration) return;

    setTesting(true);
    setError('');

    try {
      const response = await fetch('/api/slack/test', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setError('✅ Test message sent successfully!');
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setError('❌ Failed to send test message');
    } finally {
      setTesting(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Slack Integration</h3>
          <p className="text-sm text-gray-500">
            Get real-time notifications and daily digests in Slack
          </p>
        </div>
        {integration ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Connected
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!integration ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💬</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Slack</h4>
          <p className="text-gray-500 mb-6">
            Get instant notifications for conversions, high-intent signals, and daily analytics digests.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Slack'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">{integration.workspace_name}</p>
                <p className="text-sm text-gray-500">#{integration.channel_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestMessage}
                  disabled={testing}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Message'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Disconnect
                </button>
              </div>
            </div>
            
            {/* Channel Info */}
            <div>
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Make sure the bot (@webanalytics) is added to the #{integration.channel_name} channel in Slack.
                <br />
                If you need to change the channel, disconnect and reconnect with a different channel name.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h4>
            <div className="space-y-3">
              {[
                { key: 'conversions', label: 'Conversions', description: 'Get notified when someone converts' },
                { key: 'high_intent', label: 'High Intent Signals', description: 'Phone clicks, email clicks, form submissions' },
                { key: 'frustration', label: 'Frustration Alerts', description: 'Rage clicks and JavaScript errors' },
                { key: 'daily_digest', label: 'Daily Digest', description: 'Morning summary of yesterday\'s analytics' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={key}
                      type="checkbox"
                      checked={integration.alert_preferences[key as keyof typeof integration.alert_preferences]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      disabled={updating}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={key} className="font-medium text-gray-700">
                      {label}
                    </label>
                    <p className="text-gray-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
            <strong>Note:</strong> This is a simplified setup for testing. In production, you would use Slack's OAuth flow for secure authentication.
          </div>
        </div>
      )}
    </div>
  );
}
