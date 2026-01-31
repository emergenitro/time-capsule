import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, replies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { slackClient } from '@/lib/slack/client';

function verifySlackRequest(req: NextRequest, body: string): boolean {
  const slackSignature = req.headers.get('x-slack-signature');
  const slackTimestamp = req.headers.get('x-slack-request-timestamp');
  
  if (!slackSignature || !slackTimestamp) return false;

  const signingSecret = process.env.SLACK_SIGNING_SECRET!;
  const sigBasestring = `v0:${slackTimestamp}:${body}`;
  const mySignature = 'v0=' + 
    crypto.createHmac('sha256', signingSecret)
      .update(sigBasestring)
      .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const payload = JSON.parse(body);

    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    if (!verifySlackRequest(req, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    if (payload.event?.type === 'message' && !payload.event.bot_id) {
      const userId = payload.event.user;
      const messageText = payload.event.text;
      const channelType = payload.event.channel_type;

      if (channelType !== 'im') {
        return NextResponse.json({ ok: true });
      }

      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.slackUserId, userId),
            eq(users.owesReply, true)
          )
        )
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json({ ok: true });
      }

      await db.insert(replies).values({
        slackUserId: userId,
        replyText: messageText,
      });

      await db
        .update(users)
        .set({ owesReply: false })
        .where(eq(users.slackUserId, userId));

      slackClient.chat.postMessage({
        channel: userId,
        text: "Thanks for your reply! It will be sent to someone else tomorrow as their mundane statement.",
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling event:', error);
    return NextResponse.json({ ok: true });
  }
}
