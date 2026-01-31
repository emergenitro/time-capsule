import { WebClient } from '@slack/web-api';

if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('SLACK_BOT_TOKEN is required');
}

export const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function sendDM(userId: string, text: string) {
  try {
    const result = await slackClient.conversations.open({
      users: userId,
    });

    if (!result.channel?.id) {
      throw new Error('Failed to open DM channel');
    }

    await slackClient.chat.postMessage({
      channel: result.channel.id,
      text,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending DM:', error);
    return { success: false, error };
  }
}
