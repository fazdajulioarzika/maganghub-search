import React, { useState, useEffect } from "react";

const App = () => {
  const [filters, setFilters] = useState({
    keyword: "",
    order_by: "jumlah_terdaftar",
    order_direction: "ASC",
    limit: 10,
    kode_provinsi: "",
    kode_kabupaten: "",
  });
  const [provinsiList, setProvinsiList] = useState([]);
  const [kabupatenList, setKabupatenList] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Ambil daftar provinsi dari API wilayah.id
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/provinces");
        const data = await res.json();
        setProvinsiList(data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data provinsi:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 🔹 Ambil daftar kabupaten ketika provinsi berubah
  useEffect(() => {
    const fetchKabupaten = async () => {
      if (!filters.kode_provinsi) {
        setKabupatenList([]);
        return;
      }
      try {
        const res = await fetch(`/api/regencies?code=${selectedProvince}`);
        const data = await res.json();
        setKabupatenList(data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data kabupaten:", error);
      }
    };
    fetchKabupaten();
  }, [filters.kode_provinsi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });

    if (name === "kode_provinsi") {
      setFilters((prev) => ({ ...prev, kode_kabupaten: "" }));
    }
  };

  // 🔹 Ambil data magang dari MagangHub
  const fetchData = async () => {
    setLoading(true);
    setResults([]);

    const params = new URLSearchParams({
      order_by: filters.order_by,
      order_direction: filters.order_direction,
      page: 1,
      limit: filters.limit,
    });

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.kode_provinsi)
      params.append("kode_provinsi", filters.kode_provinsi);
    if (filters.kode_kabupaten)
      params.append(
        "kode_kabupaten",
        filters.kode_kabupaten.replace(/\./g, "")
      ); // 🔥 hapus titik

    try {
      const response = await fetch(
        `https://maganghub.kemnaker.go.id/be/v1/api/list/vacancies-aktif?${params}`
      );
      const json = await response.json();
      const data = json.data || [];

      const clean = data.map((d) => {
        let programTitles = [];
        try {
          programTitles = d.program_studi
            ? JSON.parse(d.program_studi).map((p) => p.title)
            : [];
        } catch {
          programTitles = [];
        }
        return {
          posisi: d.posisi,
          perusahaan: d.perusahaan?.nama_perusahaan,
          lokasi: d.perusahaan?.nama_kabupaten,
          jumlah_kuota: d.jumlah_kuota,
          jumlah_terdaftar: d.jumlah_terdaftar,
          program_studi: programTitles,
        };
      });

      setResults(clean);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">
        Pencarian Magang - MagangHub By Arzika
      </h1>

      {/* Form Filter */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Contoh: IT, Designer"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order By
            </label>
            <select
              name="order_by"
              value={filters.order_by}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="jumlah_terdaftar">Jumlah Terdaftar</option>
              <option value="jumlah_kuota">Jumlah Kuota</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Direction
            </label>
            <select
              name="order_direction"
              value={filters.order_direction}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="ASC">ASC (Kecil ke Besar)</option>
              <option value="DESC">DESC (Besar ke Kecil)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit Data
            </label>
            <input
              type="number"
              name="limit"
              value={filters.limit}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provinsi
            </label>
            <select
              name="kode_provinsi"
              value={filters.kode_provinsi}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Pilih Provinsi</option>
              {provinsiList.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kabupaten / Kota
            </label>
            <select
              name="kode_kabupaten"
              value={filters.kode_kabupaten}
              onChange={handleChange}
              disabled={!kabupatenList.length}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100"
            >
              <option value="">Pilih Kabupaten / Kota</option>
              {kabupatenList.map((k) => (
                <option key={k.code} value={k.code}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={fetchData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
          >
            {loading ? "Mengambil data..." : "Cari Magang"}
          </button>
        </div>
      </div>

      {/* Hasil */}
      {loading ? (
        <p className="text-center text-gray-600">⏳ Mengambil data...</p>
      ) : results.length > 0 ? (
        <>
          <div className="text-sm text-gray-700 mb-3">
            Menampilkan <strong>{results.length}</strong> Lowongan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((r, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <h2 className="text-lg font-bold text-blue-700 mb-1">
                  {r.posisi}
                </h2>
                <p className="text-gray-700">{r.perusahaan}</p>
                <p className="text-sm text-gray-500 mb-2">{r.lokasi}</p>

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Kuota:</strong> {r.jumlah_kuota ?? 0} |{" "}
                    <strong>Terdaftar:</strong> {r.jumlah_terdaftar ?? 0}
                  </p>

                  {/* Perhitungan peluang + badge */}
                  {(() => {
                    const kuota = Number(r.jumlah_kuota) || 0;
                    const daftarSaatIni = Number(r.jumlah_terdaftar) || 0;
                    const totalJikaKamu = daftarSaatIni + 1;

                    let ratio = 0;
                    if (totalJikaKamu > 0) ratio = kuota / totalJikaKamu;
                    if (ratio > 1) ratio = 1;

                    const percent = Math.round(ratio * 100);

                    // Tentukan warna dan label badge
                    let textClass = "text-gray-600";
                    let bgClass = "bg-gray-200";
                    let badgeClass = "bg-gray-300 text-gray-800";
                    let label = "Tidak tersedia";

                    if (percent >= 75) {
                      textClass = "text-green-700 font-semibold";
                      bgClass = "bg-green-200";
                      badgeClass = "bg-green-100 text-green-800";
                      label = "Tinggi";
                    } else if (percent >= 50) {
                      textClass = "text-yellow-700 font-semibold";
                      bgClass = "bg-yellow-200";
                      badgeClass = "bg-yellow-100 text-yellow-800";
                      label = "Cukup";
                    } else if (percent >= 25) {
                      textClass = "text-orange-700 font-semibold";
                      bgClass = "bg-orange-200";
                      badgeClass = "bg-orange-100 text-orange-800";
                      label = "Rendah";
                    } else {
                      textClass = "text-red-700 font-semibold";
                      bgClass = "bg-red-200";
                      badgeClass = "bg-red-100 text-red-800";
                      label = "Sangat Rendah";
                    }

                    return (
                      <div className="mt-2">
                        <p>
                          <strong>Peluang (jika kamu daftar):</strong>{" "}
                          <span className={textClass}>{percent}%</span>
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}
                          >
                            {label}
                          </span>
                        </p>

                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full mt-2 bg-gray-200 overflow-hidden">
                          <div
                            className={`${bgClass} h-full`}
                            style={{
                              width: `${percent}%`,
                              transition: "width .4s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <p className="mt-3">
                    <strong>Program Studi:</strong>{" "}
                    {r.program_studi && r.program_studi.length > 0
                      ? r.program_studi.join(", ")
                      : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Tidak ada data ditampilkan.</p>
      )}
    </div>
  );
};

export default App;
