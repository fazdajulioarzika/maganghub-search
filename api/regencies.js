export default async function handler(req, res) {
  const { code } = req.query; // ?code=36 misalnya
  if (!code) return res.status(400).json({ error: "Missing province code" });

  try {
    const response = await fetch(
      `https://wilayah.id/api/regencies/${code}.json`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data kabupaten" });
  }
}
