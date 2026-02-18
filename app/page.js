'use client';
import { useEffect, useState } from "react";
import Form from "next/form";

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
    const result = await response.json();
    alert(result.message);
  }

  return (
    <Form onChange={handleChange} onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Your email" required />
      <input type="text" name="name" placeholder="Your name" required />
      <textarea name="message" placeholder="Your message" required></textarea>
      <button type="submit">Send Message</button>
      <p className="disclaimer">Your message will be sent at a random time from the next hour to the next year!</p>
    </Form>
  );
}
