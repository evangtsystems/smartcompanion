
import Header from "../src/components/header";
import { Toaster } from "react-hot-toast"; // ✅ Add this import

export const metadata = { title: "Smart Companion" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f8f8f8",
        }}
      >
        <Header />
        <main style={{ padding: "20px" }}>{children}</main>

        {/* ✅ Toast notification container */}
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
      </body>
    </html>
  );
}

