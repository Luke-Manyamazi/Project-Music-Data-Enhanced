// Helper: Get local day string (YYYY-MM-DD) from timestamp
export function getDay(ts) {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Check if listen is on Friday night (Fri 5pm–Sat 4am)
export function isFridayNight(ts) {
  const d = new Date(ts);
  const day = d.getDay();
  const hour = d.getHours();
  return (day === 5 && hour >= 17) || (day === 6 && hour < 4);
}