const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const { name, email, message, consent } = req.body;

  if (!file) {
    return res.status(400).send("Dosya yüklenemedi.");
  }

  // DEBUG: konsola yaz
  console.log("İsim:", name);
  console.log("E-posta:", email);
  console.log("Açıklama:", message);
  console.log("Onay:", consent);
  console.log("Dosya yolu:", file.path);

  // Buraya e-posta gönderme ya da başka işlem gelecek
  res.status(200).send("Dosyanız başarıyla alındı. Teşekkür ederiz.");
});
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: 'Yeni Dosya Yüklemesi',
    text: `E-posta: ${email}\nMesaj: ${message}`,
    attachments: [
      {
        filename: file.originalname,
        path: file.path
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send('Dosya başarıyla gönderildi.');
  } catch (err) {
    console.error(err);
    res.status(500).send('E-posta gönderilemedi.');
  }
});

app.listen(3000, () => {
  console.log('Sunucu http://localhost:3000 adresinde çalışıyor');
});
