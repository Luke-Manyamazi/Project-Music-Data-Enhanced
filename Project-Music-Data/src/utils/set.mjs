// Helper: Get intersection of sets

export function intersection(arrays) {
  if (!arrays || arrays.length === 0) return new Set();

  // Ensure everything is a Set
  const sets = arrays.map((a) => new Set(a));

  // Reduce safely
  return sets.reduce((acc, s) => {
    if (!s || s.size === 0) return new Set(); 
    return new Set([...acc].filter((x) => s.has(x)));
  }, sets[0]);
}
