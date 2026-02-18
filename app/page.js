'use client';
import { useEffect, useState } from "react";
import Form from "next/form";

const FORM_SHADOW = {
  boxShadow: `
    0.5px 1px 1px hsl(220deg 30% 50% / 0.08),
    1px 2px 2px hsl(220deg 30% 50% / 0.08),
    2px 4px 4px hsl(220deg 30% 50% / 0.08),
    4px 8px 8px hsl(220deg 30% 50% / 0.08),
    8px 16px 16px hsl(220deg 30% 50% / 0.08)
  `,
};

export default function Home() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      document.getElementById("successerror-message").textContent = "Failed to send message. Please try again.";
      document.getElementById("successerror-message").style.color = "#E74C3C";
      return;
    }

    setFormData({ email: "", name: "", message: "" });
    document.getElementById("successerror-message").textContent = "Message sent successfully!";
    document.getElementById("successerror-message").style.color = "#04b34f";
  }

  return (
    <div className="max-w-xl w-full mx-auto p-4 flex items-center justify-center h-screen main">
      <Form onSubmit={handleSubmit} style={FORM_SHADOW} className="w-full border border-gray-200 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Send a Time Capsule Message</h1>
        <label className="block mb-1">Email:</label>
        <input type="email" value={formData.email} onChange={handleChange} name="email" placeholder="Your email" className="w-full p-2 border border-gray-300 rounded" required />
        <label className="block mb-1 mt-4">Name:</label>
        <input type="text" value={formData.name} onChange={handleChange} name="name" placeholder="Your name" className="w-full p-2 border border-gray-300 rounded" required />
        <label className="block mb-1 mt-4">Message:</label>
        <textarea value={formData.message} onChange={handleChange} name="message" placeholder="Your message" className="min-h-24 w-full p-2 border border-gray-300 rounded field-sizing-content resize-none" required></textarea>
        <button type="submit" className="hover:cursor-pointer mt-4 block w-full p-2 rounded bg-blue-400 text-white hover:bg-blue-500 transition-colors">Send Message</button>
        <p className="text-sm mt-2" id="successerror-message"></p>
        <p className="text-sm mt-4">Your message will be sent at a random time anytime between the next hour to the next year!</p>
      </Form>
    </div>
  );
}
