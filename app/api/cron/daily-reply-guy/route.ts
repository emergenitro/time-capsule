import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, replies } from '@/lib/db/schema';
import { eq, and, isNull, desc, ne, sql } from 'drizzle-orm';
import { sendDM } from '@/lib/slack/client';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const timedOutUsers = await db
      .update(users)
      .set({ owesReply: false })
      .where(
        and(
          eq(users.owesReply, true),
          sql`${users.lastMessageSentAt} < ${fortyEightHoursAgo}`
        )
      )
      .returning();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const eligibleUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isOptedIn, true),
          eq(users.owesReply, false),
          // Either never got a message, or got one more than 24 hours ago
          sql`(${users.lastMessageSentAt} IS NULL OR ${users.lastMessageSentAt} < ${twentyFourHoursAgo})`
        )
      );

    if (eligibleUsers.length === 0) {
      return NextResponse.json({ message: 'No eligible users' });
    }

    const numToMessage = Math.min(
      Math.floor(Math.random() * 6) + 5,
      eligibleUsers.length
    );

    const shuffled = eligibleUsers.sort(() => Math.random() - 0.5);
    const selectedUsers = shuffled.slice(0, numToMessage);

    const results = [];

    for (const user of selectedUsers) {
      const allUnusedReplies = await db
        .select()
        .from(replies)
        .where(isNull(replies.usedAt))
        .orderBy(desc(replies.createdAt));

      const availableReplies = allUnusedReplies.filter(
        reply => reply.slackUserId !== user.slackUserId
      );

      let statementText: string;
      let replyId: number | null = null;

      if (availableReplies.length > 0) {
        const randomReply = availableReplies[Math.floor(Math.random() * availableReplies.length)];
        statementText = randomReply.replyText;
        replyId = randomReply.id;
      } else {
        const defaults = [
          "I had a sandwich today.",
          "My coffee was lukewarm.",
          "I saw a bird.",
          "The weather exists.",
          "I blinked approximately 15 times in the last minute.",
          "My phone is at 67% battery.",
          "I counted 3 clouds.",
        ];
        statementText = defaults[Math.floor(Math.random() * defaults.length)];
      }

      const result = await sendDM(
        user.slackUserId,
        `📨 Your daily mundane statement:\n\n"${statementText}"\n\nReply to this message with your own mundane observation. Your reply will become someone else's statement.`
      );

      if (result.success) {
        await db
          .update(users)
          .set({
            owesReply: true,
            lastMessageSentAt: new Date(),
          })
          .where(eq(users.slackUserId, user.slackUserId));

        if (replyId) {
          await db
            .update(replies)
            .set({
              usedAt: new Date(),
              sentToUserId: user.slackUserId,
            })
            .where(eq(replies.id, replyId));
        }

        results.push({ userId: user.slackUserId, success: true });
      } else {
        results.push({ userId: user.slackUserId, success: false });
      }
    }

    return NextResponse.json({
      message: `Sent ${results.filter(r => r.success).length} statements`,
      timedOutUsers: timedOutUsers.length,
      results,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}