import { pgTable, text, timestamp, boolean, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  slackUserId: text('slack_user_id').notNull().unique(),
  isOptedIn: boolean('is_opted_in').default(true).notNull(),
  lastMessageSentAt: timestamp('last_message_sent_at'),
  owesReply: boolean('owes_reply').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const replies = pgTable('replies', {
  id: serial('id').primaryKey(),
  slackUserId: text('slack_user_id').notNull(),
  replyText: text('reply_text').notNull(),
  sentToUserId: text('sent_to_user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'),
});
