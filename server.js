const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("Dosya yüklenemedi.");
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Yeni Teklif Dosyası",
      text: `Ad: ${name}\nE-posta: ${email}\nMesaj: ${message}`,
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // ✅ Yönlendirme: vahric.com
    res.redirect("https://vahric.com/?success=1");
  } catch (error) {
    console.error("Mail gönderim hatası:", error);
    res.status(500).send("Bir hata oluştu.");
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
