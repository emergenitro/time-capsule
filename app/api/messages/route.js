import { neon } from "@neondatabase/serverless";
import { getRandomDateTime } from "@/lib/utils";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
    const { email, name, message } = await request.json();
    
    if (!email || !message) {
        return new Response(JSON.stringify({ success: false, message: "Email and message are required." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ success: false, message: "Invalid email format." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (message.length > 5000 || (name && name.length > 100)) {
        return new Response(JSON.stringify({ success: false, message: "Message or name is too long." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const randomDateTime = getRandomDateTime();

    await sql`
        INSERT INTO messages (email, name, message, send_at)
        VALUES (${email}, ${name}, ${message}, ${randomDateTime})
    `;

    return new Response(JSON.stringify({ success: true, message: "Message received!" }), {
        headers: { "Content-Type": "application/json" },
    });
} 