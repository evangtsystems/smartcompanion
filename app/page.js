"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import QrScannerModal from "../src/components/QrScannerModal";
import InstallAppButton from "../src/components/InstallAppButton";
import EmergencyContacts from "../src/components/EmergencyContacts";


export default function Home() {
  const router = useRouter();


  // 🧹 TEMP FIX — clear old PWA caches & service workers
  

  useEffect(() => {
    document.querySelectorAll(".fade").forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = 1;
        el.style.transform = "translateY(0)";
      }, 300 * i);
    });
  }, []);

  useEffect(() => {
  const video = document.querySelector(".hero-video");
  if (video) {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Some browsers require explicit interaction first
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }
}, []);


  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: "#fdfaf4",
      }}
    >
      {/* Hero Section */}
<section className="hero-section">
  {/* Heading (always visible) */}
  <h1 className="hero-heading fade">
    Welcome to Your Villa’s Smart Companion
  </h1>

  {/* Background Video */}
  <div className="video-container">
   <video
  className="hero-video"
  playsInline
  autoPlay
  muted
  loop
  preload="metadata"
 
  onCanPlay={(e) => e.target.play().catch(() => {})}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#1f3b2e",
  }}
>
  <source src="/smartcompanion-video.mp4" type="video/mp4" />
  <source src="/smartcompanion-video.webm" type="video/webm" />
</video>



  </div>

  {/* Overlay */}
  <div className="overlay" />

  {/* Text & Button */}
  <div className="text-content fade">
    <p className="hero-paragraph">
      Your digital concierge for a truly Mediterranean stay — request services,
      discover local gems, or enjoy a glass of wine while we take care of the
      rest.
    </p>

    <button
      onClick={() => router.push("/villa/villa-panorea")}
      className="hero-button"
    >
      Start Your Experience
    </button>

    <QrScannerModal />
    <InstallAppButton />
  </div>

  <style jsx>{`
    .hero-section {
      position: relative;
      width: 100%;
      height: 100svh;
      margin: 0;
      padding: 0;
      color: white;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
    }

    /* --- FIX CROPPED TEXT ON MOBILE --- */
@media (max-width: 768px) {
  .hero-section {
    height: auto !important;       /* let it expand naturally */
    min-height: 100dvh;            /* cover the screen but allow overflow */
    overflow: visible !important;  /* nothing gets cut */
    padding-bottom: 80px;          /* ensures space below paragraph/button */
  }

  .text-content {
    background: #1f3b2e;
    padding: 25px 15px 80px;       /* add breathing room for bottom text */
    color: white;
    overflow: visible !important;
  }

  .hero-paragraph {
    overflow: visible !important;
    line-height: 1.65;
    font-size: clamp(0.95rem, 4.3vw, 1.05rem);
  }
}


    .video-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(#1f3b2e, #1f3b2e);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      z-index: 0;
    }

    .hero-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      opacity: 0;
      animation: fadeIn 2s ease forwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(rgba(25, 40, 30, 0.45), rgba(25, 40, 30, 0.45));
      z-index: 1;
    }

    .hero-heading {
      z-index: 2;
      font-family: 'Playfair Display', serif;
      font-size: 2.8rem;
      font-weight: 600;
      line-height: 1.3;
      max-width: 800px;
      padding: 0 20px;
      transition: all 1s ease;
    }

    .text-content {
      z-index: 2;
      padding: 0 20px;
      max-width: 600px;
    }

    .hero-paragraph {
      margin-top: 25px;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .hero-button {
      margin-top: 45px;
      padding: 14px 36px;
      border-radius: 30px;
      background-color: #f5d67b;
      color: #1f3b2e;
      border: none;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s ease;
    }

    .hero-button:hover {
      background-color: #f1c94d;
    }

    @media (max-width: 768px) {
  .hero-section {
    height: auto !important;
    min-height: 100dvh;
    overflow: visible !important;
    background: #1f3b2e;
    padding-bottom: 80px;
  }

  .video-container {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 260px;
    background: #1f3b2e;
    overflow: hidden;
  }

  .hero-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background-color: #1f3b2e;
  }

  .overlay {
    display: none;
  }

  .hero-heading {
    width: 100%;
    margin: 0;
    text-align: left;
    padding: 14px 0 8px 10px;
    background: #1f3b2e;
    color: #fff;
    font-size: clamp(1.6rem, 6.2vw, 2rem);
    line-height: 1.25;
  }

  .text-content {
  width: 100% !important;          /* 👈 use container width, not viewport */
  max-width: none !important;
  background: #1f3b2e;
  padding: 22px 14px 80px 10px;    /* 👈 balanced padding */
  color: white;
  overflow: visible !important;
  text-align: left;
  box-sizing: border-box;
}

.hero-paragraph {
  width: 100%;
  margin-top: 18px;
  padding: 0;                      /* 👈 no extra padding inside */
  font-size: clamp(0.95rem, 4.2vw, 1.05rem);
  line-height: 1.7;
  text-align: left;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  box-sizing: border-box;
}


  .hero-button {
    margin-top: 30px;
  }
}







  `}</style>
</section>


      {/* Lifestyle Features */}
      <section
        style={{
          padding: "70px 20px",
          background: "#fdfaf4",
          color: "#1f3b2e",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.9rem",
            fontFamily: "'Playfair Display', serif",
            marginBottom: "40px",
          }}
        >
          Experience Effortless Mediterranean Living
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {[
            {
              icon: "🍋",
              title: "Local Flavors",
              desc: "Order fresh fruit, local wines, or Corfiot delicacies.",
            },
            {
              icon: "🕯️",
              title: "Villa Comfort",
              desc: "Schedule cleaning or in-villa spa treatments with a tap.",
            },
            {
              icon: "☀️",
              title: "Island Discovery",
              desc: "Plan your day with personalized Corfu recommendations.",
            },
            {
              icon: "💬",
              title: "Stay Connected",
              desc: "Your host and concierge are always one tap away.",
            },

            
          ].map((item) => (
            <div
              key={item.title}
              style={{
                flex: "1 1 220px",
                background: "white",
                padding: "30px",
                borderRadius: "14px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 5px 15px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 3px 10px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "10px" }}>
                {item.icon}
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "1.2rem" }}>
                {item.title}
              </h3>
              <p style={{ color: "#555", fontSize: "0.95rem" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


    
<EmergencyContacts />


      {/* Footer */}
      <footer
        style={{
          background: "#1f3b2e",
          color: "white",
          textAlign: "center",
          padding: "25px",
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} GT Systems — Smart Companion for Villas
      </footer>
    </div>
  );
}
