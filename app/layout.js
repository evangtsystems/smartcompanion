
import Header from "../src/components/header";

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
      </body>
    </html>
  );
}
