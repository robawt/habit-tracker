import "./globals.css";
import Navbar from "@/components/Navbar";

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
      <body className="min-h-screen bg-old-yellow-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
