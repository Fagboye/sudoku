import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const embed = {
  version: "1",
  imageUrl: `https://sudoku-rouge-zeta.vercel.app/sudoku.png?v=3`,
  button: {
    title: "Launch Sudoku",
    action: {
      type: "launch_frame",
      name: "Sudoku",
      url: "https://sudoku-rouge-zeta.vercel.app",
      splashImageUrl: `https://sudoku-rouge-zeta.vercel.app/sudoku.png?v=3`,
      splashBackgroundColor: "#ffffff"
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="fc:miniapp" content={JSON.stringify(embed)} />
        <meta name="fc:frame" content={JSON.stringify(embed)} />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
