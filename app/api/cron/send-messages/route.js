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
        SELECT id, email, name, message FROM messages
        WHERE send_at <= NOW() AND sent = FALSE
    `;

    for (const msg of messages) {
        try {
            await sendMail(msg.email, "Your Time Capsule Message", `Hi ${msg.name},\n\nHere is your message:\n\n${msg.message}\n\nBest,\nTime Capsule Team`);
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