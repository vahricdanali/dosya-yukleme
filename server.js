const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// uploads klasörünü oluştur (yoksa)
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Statik dosyalar (public klasörü içindekiler)
app.use(express.static('public'));

// Ana sayfa (index.html varsa public klasörüne koyulmalı)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Dosya yükleme işlemi
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Dosya yüklenemedi.');
  }

  // Mail ayarları
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Dosya Yükleme Sistemi" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: 'Yeni dosya yüklendi!',
    text: `Yeni bir dosya yüklendi: ${req.file.filename}`,
    attachments: [
      {
        filename: req.file.originalname,
        path: req.file.path
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    // Başarılıysa dış siteye yönlendir
    res.redirect('https://vahric.com/?success=1');
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
    res.status(500).send('Dosya yüklendi ama mail gönderilemedi.');
  }
});

// Sunucu başlat
app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});
