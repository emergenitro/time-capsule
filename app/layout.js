import { Sour_Gummy } from "next/font/google";
import "./globals.css";

const Sour_Gummy_Font = Sour_Gummy({
  subsets: ["latin"],
  variable: "--font-sour-gummy",
  weight: ["400", "200"]
});

export const metadata = {
  title: "Time Capsule",
  description: "Send a message to future self :P",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${Sour_Gummy_Font.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
