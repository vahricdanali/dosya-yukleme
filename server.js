// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Klasör oluşturma (eğer yoksa)
const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Form verisini almak için
app.use(express.urlencoded({ extended: true }));

// Dosya yükleme ayarı
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Ana sayfa
app.get('/', (req, res) => {
  const success = req.query.success === '1';
  res.send(`
    <html>
      <head>
        <title>Dosya Yükleme</title>
        <style>
          body { font-family: Arial; padding: 40px; }
          .alert { color: green; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        ${success ? '<div class="alert">Dosya başarıyla gönderildi ve e-posta ile iletildi.</div>' : ''}
        <form action="/upload" method="POST" enctype="multipart/form-data">
          <label>Dosya Seç: <input type="file" name="file" required /></label><br><br>
          <label>Açıklama:<br><textarea name="message" rows="4" cols="40"></textarea></label><br><br>
          <button type="submit">Gönder</button>
        </form>
      </body>
    </html>
  `);
});

// Dosya yükleme ve mail gönderme
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('Dosya yüklenemedi');

  // Mail gönderimi
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Dosya Sistemi <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: 'Yeni dosya yüklendi!',
      text: `Yeni dosya yüklendi: ${req.file.filename}\n\nAçıklama:\n${req.body.message || 'Yok'}`,
      attachments: [{
        filename: req.file.originalname,
        path: req.file.path
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('Mail gönderildi.');
    res.redirect('https://vahric.com/?success=1');

  } catch (err) {
    console.error('Mail gönderme hatası:', err);
    res.status(500).send('Mail gönderme hatası');
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
