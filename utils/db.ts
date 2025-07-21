export const saveMintToLocalDB = (mint: string) => {
  const list = JSON.parse(localStorage.getItem("mints") || "[]");
  if (!list.includes(mint)) {
    list.push(mint);
    localStorage.setItem("mints", JSON.stringify(list));
  }
};

export const getSavedMints = (): string[] => {
  return JSON.parse(localStorage.getItem("mints") || "[]");
}; 