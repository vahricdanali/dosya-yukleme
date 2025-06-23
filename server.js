const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Gelen verileri işleyebilmek için
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// "uploads" klasörü yoksa oluştur
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Dosya yükleme ve form verisi alma endpoint’i
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const { name, email, message, consent } = req.body;

  if (!file) {
    return res.status(400).send("Dosya yüklenemedi.");
  }

  // Terminale bilgi yazdır
  console.log("✅ Dosya alındı:");
  console.log("Ad:", name);
  console.log("E-posta:", email);
  console.log("Mesaj:", message);
  console.log("Onay:", consent);
  console.log("Dosya adı:", file.filename);
  console.log("Yol:", file.path);

  res.status(200).send("Dosyanız başarıyla yüklendi.");
});

// Anasayfa kontrolü
app.get("/", (req, res) => {
  res.send("Sunucu çalışıyor. Dosya yükleme için POST /upload kullanın.");
});

// Server başlat
app.listen(port, () => {
  console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
