import "./globals.css";

export const metadata = {
  title: "Habit Tracker",
  description: "Team habit tracking with streaks and rewards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="max-w-3xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
