import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const command = formData.get('command') as string;
    const userId = formData.get('user_id') as string;
    const userName = formData.get('user_name') as string;

    if (command === '/reply-guy') {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.slackUserId, userId))
        .limit(1);

      if (existingUser.length > 0) {
        await db
          .update(users)
          .set({ isOptedIn: true })
          .where(eq(users.slackUserId, userId));

        return NextResponse.json({
          response_type: 'ephemeral',
          text: "You're already in the Reply Guy chain! You'll receive a mundane statement from someone random every day. When you get one, reply to it and your reply becomes someone else's statement tomorrow.",
        });
      }

      await db.insert(users).values({
        slackUserId: userId,
        isOptedIn: true,
        owesReply: false,
      });

      return NextResponse.json({
        response_type: 'ephemeral',
        text: "Welcome to Reply Guy!\n\nEvery day at a random time, you'll receive a mundane statement from another random person in the chain. Reply to it, and your reply becomes someone else's statement tomorrow.\n\nExamples of good mundane statements:\n• \"I had a sandwich today.\"\n• \"My coffee was lukewarm.\"\n• \"I saw a bird.\"\n\nThe more absurd your replies, the better. Have fun!",
      });
    }

    if (command === '/reply-guy-out') {
      await db
        .update(users)
        .set({ isOptedIn: false })
        .where(eq(users.slackUserId, userId));

      return NextResponse.json({
        response_type: 'ephemeral',
        text: "You've been removed from the Reply Guy chain. Use /reply-guy to rejoin anytime!",
      });
    }

    if (command === '/reply-guy-status') {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.slackUserId, userId))
        .limit(1);

      if (user.length === 0 || !user[0].isOptedIn) {
        return NextResponse.json({
          response_type: 'ephemeral',
          text: "You're not in the Reply Guy chain. Use /reply-guy to join!",
        });
      }

      const status = user[0].owesReply
        ? "You currently OWE a reply. Check your DMs and respond to the bot's message!"
        : "You're all caught up! Wait for your next mundane statement.";

      return NextResponse.json({
        response_type: 'ephemeral',
        text: `Reply Guy Status:\n• Opted in: ✅\n• ${status}`,
      });
    }

    return NextResponse.json(
      { text: 'Unknown command' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling command:', error);
    return NextResponse.json(
      { text: 'Something went wrong!' },
      { status: 500 }
    );
  }
}
