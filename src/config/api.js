const apiBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5000");

export default apiBaseUrl;
