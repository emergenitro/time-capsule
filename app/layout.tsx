export const metadata = {
  title: 'Reply Guy Bot',
  description: 'A Slack bot for absurdist mundane statements',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
