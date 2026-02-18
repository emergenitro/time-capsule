import { sendMail } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";

export async function GET(request) {
    if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const sql = neon(process.env.DATABASE_URL);

    const messages = await sql`
        SELECT id, email, name, message, created_at FROM messages
        WHERE send_at <= NOW() AND sent = FALSE
    `;

    for (const msg of messages) {
        try {
            const greeting = msg.name ? `Hi ${msg.name},` : "Hey there,";
            const sentDate = new Date(msg.created_at).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            const emailBody = `${greeting}

A little while ago, you wrote yourself a message and sealed it away - and today's the day it finally reaches you.

Here's what you had to say:

———

${msg.message}

———

This message was written on ${sentDate} (EU/UK date format btw). Hope it brings back some memories, makes you smile, or maybe even surprises you a little.

take care of yourself,
karthik`;

            await sendMail(msg.email, "📬 A message from your past self", emailBody);
            await sql`
                UPDATE messages SET sent = TRUE WHERE id = ${msg.id}
            `;
        } catch (error) {
            console.error(`Failed to send message ID ${msg.id}:`, error);
        }
    }

    return new Response(JSON.stringify({ success: true, message: "Messages processed!" }), {
        headers: { "Content-Type": "application/json" },
    });
}