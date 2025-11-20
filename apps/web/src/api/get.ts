export const getDogs = async () => {
  const res = await fetch("http://localhost:3000/dogs");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};
