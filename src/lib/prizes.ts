export function isVrPrize(prize?: string | null) {
  const normalized = (prize ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  return (
    normalized.includes("REALIDADE VIRTUAL") ||
    normalized.includes("OCULOS") ||
    /\bVR\b/.test(normalized)
  );
}
