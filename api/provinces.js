export default async function handler(req, res) {
  try {
    const response = await fetch("https://wilayah.id/api/provinces.json");
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Gagal ambil data dari wilayah.id" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
}
