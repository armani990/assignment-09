
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import Navbar from "@/components/navbar";
import Toaster from "@/components/toaster";
import Footer from "@/components/footer";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "PizzaHub",
  description: "Order your favorite pizza with PizzaHub.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`dark ${bricolageGrotesque.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <Toaster />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
