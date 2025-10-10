"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleAction = () => {
    if (isLoggedIn && pathname === "/dashboard") {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      router.push("/owner-access");
    } else if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/owner-access");
    }
    setMenuOpen(false);
  };

  const getButtonLabel = () => {
    if (isLoggedIn && pathname === "/dashboard") return "Logout";
    return isLoggedIn ? "Owner Dashboard" : "Owner Access";
  };

  return (
    <header
      style={{
        background: "#1f3b2e",
        color: "white",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Brand — clickable to homepage */}
      <h2
        style={{
          margin: 0,
          fontWeight: 700,
          fontSize: "1.3rem",
          letterSpacing: "0.5px",
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
        Smart Companion
      </h2>

      {/* Desktop Button */}
      <nav style={{ display: "flex", gap: "16px" }} className="desktop-nav">
        <button
          onClick={handleAction}
          style={{
            background: "white",
            color: "#1f3b2e",
            padding: "8px 16px",
            borderRadius: "20px",
            fontWeight: "bold",
            textDecoration: "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          {getButtonLabel()}
        </button>
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "1.8rem",
          cursor: "pointer",
          display: "none",
        }}
        className="menu-toggle"
      >
        ☰
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            background: "#fff",
            color: "#1f3b2e",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            padding: "10px 20px",
          }}
        >
          <button
            onClick={handleAction}
            style={{
              display: "block",
              padding: "8px 0",
              color: "#1f3b2e",
              textDecoration: "none",
              fontWeight: "bold",
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {getButtonLabel()}
          </button>
        </div>
      )}

      {/* Inline Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          .menu-toggle {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
