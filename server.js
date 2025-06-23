const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { name, email, message, consent } = req.body;

  if (!file) {
    return res.status(400).send("Dosya yüklenemedi.");
  }

  console.log("✅ Dosya alındı:");
  console.log("Ad:", name);
  console.log("E-posta:", email);
  console.log("Mesaj:", message);
  console.log("Onay:", consent);
  console.log("Dosya adı:", file.filename);
  console.log("Yol:", file.path);

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Form Botu" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: "Yeni dosya yüklemesi ve form bilgileri",
      text: `
Ad: ${name}
E-posta: ${email}
Mesaj: ${message}
Onay: ${consent}

Yüklenen Dosya: ${file.filename}
Yol: ${file.path}
      `,
      attachments: [
        {
          filename: file.originalname,
          path: file.path
        }
      ]
    });

    console.log("📧 Mail gönderildi!");
    res.status(200).send("Dosyanız yüklendi ve mail gönderildi.");
  } catch (error) {
    console.error("❌ Mail gönderme hatası:", error);
    res.status(500).send("Dosya yüklendi ama mail gönderilemedi.");
  }
});

app.get("/", (req, res) => {
  res.send("Sunucu çalışıyor. Dosya yükleme için POST /upload kullanın.");
});

app.listen(port, () => {
  console.log(`🚀 Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
