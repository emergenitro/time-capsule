import { neon } from "@neondatabase/serverless";
import { getRandomDateTime } from "@/lib/utils";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
    const { email, name, message } = await request.json();
    
    const randomDateTime = getRandomDateTime();

    await sql`
        INSERT INTO messages (email, name, message, send_at)
        VALUES (${email}, ${name}, ${message}, ${randomDateTime})
    `;

    return new Response(JSON.stringify({ success: true, message: "Message received!" }), {
        headers: { "Content-Type": "application/json" },
    });
} 