"use client";
import React from "react";

export default function UsefulInfoSection() {
  const infoList = [
    {
      icon: "🛒",
      title: "Masoutis Supermarket",
      desc: "A brand-new, large supermarket at the Messonghi–Moraitika roundabout — only 3 minutes by car from Villa Panorea. Ideal for groceries, fresh produce, and daily essentials.",
      link: "https://www.google.com/maps/place/Supermarket+corfu+Masoutis/@39.4807324,19.9247354,878m/data=!3m1!1e3!4m23!1m16!4m15!1m6!1m2!1s0x135ca1c7a67c8a81:0x27a1700336176975!2sVilla+Panorea!2m2!1d19.9279522!2d39.4830094!1m6!1m2!1s0x135ca10068bc155b:0x9663513625499af3!2sSupermarket+corfu+Masoutis,+Eparchiaki+Odos+Pontis-Messogis,+Moraitika!2m2!1d19.9260341!2d39.4785093!3e2!3m5!1s0x135ca10068bc155b:0x9663513625499af3!8m2!3d39.4785359!4d19.9260038!16s%2Fg%2F11xnt2ld0t?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D",
    },
    {
      icon: "💊",
      title: "Pharmacy",
      desc: "Apotheke Moraitíka Center",
      link: "https://www.google.com/maps/place/Apotheke+Morait%C3%ADka+Center/@39.4853381,19.9223318,439m/data=!3m1!1e3!4m23!1m16!4m15!1m6!1m2!1s0x135ca1c7a67c8a81:0x27a1700336176975!2sVilla+Panorea!2m2!1d19.9279522!2d39.4830094!1m6!1m2!1s0x135ca1c9da5a9367:0x57cbf90ca5abe888!2sApotheke+Morait%C3%ADka+Center,+Epar.Od.+Vrionis-Agiou+Nikolaou,+Moraitika+490+84!2m2!1d19.9247136!2d39.4853381!3e2!3m5!1s0x135ca1c9da5a9367:0x57cbf90ca5abe888!8m2!3d39.4853381!4d19.9247136!16s%2Fg%2F11f69vwnq7?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D",
    },
    {
      icon: "⛽",
      title: "Fuel Station",
      desc: "BP Petrol Station — on the main road from Messonghi to Moraitika, around 2.5 km north-west of the villa.",
      link: "https://www.google.com/maps/place/bp/@39.477135,19.8988101,3514m/data=!3m1!1e3!4m23!1m16!4m15!1m6!1m2!1s0x135ca1c7a67c8a81:0x27a1700336176975!2sVilla+Panorea!2m2!1d19.9279522!2d39.4830094!1m6!1m2!1s0x135c9bf17155949d:0x5a8baf52a2d1e4b2!2zYnAsIM6Vz4DOsc-Bz4fOuc6xzrrOriDOn860z4zPgiDOoM6xzq_PgM61z4TOt8-CLc6czrXPg86_zrPOs86uz4IsIFZyYWdrYW5pb3Rpa2E!2m2!1d19.9119235!2d39.474744!3e2!3m5!1s0x135c9bf17155949d:0x5a8baf52a2d1e4b2!8m2!3d39.4747495!4d19.9118883!16s%2Fg%2F11cmpb1hhp?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D",
    },
    {
      icon: "🏖️",
      title: "Nearest Beach",
      desc: "Moraitika Beach — a calm sandy beach with tavernas and sunbeds, about 4 minutes on foot.",
      link: "https://www.google.com/maps/place/Moraitika+Beach/@39.477135,19.8988101,3514m/data=!3m1!1e3!4m23!1m16!4m15!1m6!1m2!1s0x135ca1c7a67c8a81:0x27a1700336176975!2sVilla+Panorea!2m2!1d19.9279522!2d39.4830094!1m6!1m2!1s0x135ca1c88607a487:0x54d016e0979520d8!2sMoraitika+Beach,+Moraitika!2m2!1d19.930058!2d39.4837341!3e2!3m5!1s0x135ca1c88607a487:0x54d016e0979520d8!8m2!3d39.4837341!4d19.930058!16s%2Fg%2F11crzrktkd?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D",
    },
  ];

  return (
    <section
      style={{
        padding: "70px 20px",
        background: "#fffef7",
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
        Useful Information Near You
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
        {infoList.map((item) => (
          <a
            key={item.title}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: "1 1 220px",
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
              textDecoration: "none",
              color: "#1f3b2e",
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
          </a>
        ))}
      </div>
    </section>
  );
}
