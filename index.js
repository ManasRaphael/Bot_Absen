const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const moment = require('moment-timezone'); // Library untuk mengelola waktu

// Setup Express
const app = express();
const PORT = process.env.PORT || 3000;

// Token bot Anda
const token = '7585018208:AAEGAtAApY4wzFIqYLU1nef1YsilLyLfBTc'; 
const bot = new TelegramBot(token, { polling: true });

// Middleware untuk parsing JSON
app.use(express.json());

// File untuk menyimpan data absensi
const dataFilePath = 'absensi.json';

// Muat data absensi dari file jika ada
let kehadiran = {};
if (fs.existsSync(dataFilePath)) {
    const fileData = fs.readFileSync(dataFilePath);
    kehadiran = JSON.parse(fileData);
}

// Endpoint untuk menerima update dari Telegram
app.post('/webhook', (req, res) => {
    const { message } = req.body;
    console.log('Received message:', message);

    if (message && message.text) {
        // Ini akan ditangani oleh 'onText' di bawah, jadi mungkin bisa diabaikan
    }

    res.sendStatus(200); // Kirim respons OK
});

// Mendengarkan perintah "/start"
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Halo! Saya bot Telegram yang berjalan di Replit. Silakan gunakan perintah /absen untuk mencatat kehadiran Anda.');
});

// Menangani perintah "/absen"
bot.onText(/\/absen/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Mendapatkan waktu saat ini
    const waktu = moment.tz("Asia/Jakarta"); // Zona waktu WIB
    const dataAbsensi = {
        username: msg.from.username || 'Unknown',
        hari: waktu.format('dddd'), // Nama hari
        tanggal: waktu.format('DD'), // Tanggal
        bulan: waktu.format('MMMM'), // Nama bulan
        tahun: waktu.format('YYYY'), // Tahun
        jam: waktu.format('HH:mm:ss'), // Jam
    };

    // Menyimpan data absensi
    kehadiran[userId] = dataAbsensi;

    // Menyimpan data ke file
    fs.writeFileSync(dataFilePath, JSON.stringify(kehadiran, null, 2));
    console.log(kehadiran); // Log untuk mengecek penyimpanan data

    bot.sendMessage(chatId, `Kehadiran Anda dicatat:\n` +
        `Hari: ${dataAbsensi.hari}\n` +
        `Tanggal: ${dataAbsensi.tanggal} ${dataAbsensi.bulan} ${dataAbsensi.tahun}\n` +
        `Jam: ${dataAbsensi.jam}`);
});

// Menangani perintah untuk melihat data absensi
bot.onText(/\/lihat_absensi/, (msg) => {
    const chatId = msg.chat.id;

    // Memeriksa apakah ada data absensi
    if (Object.keys(kehadiran).length === 0) {
        bot.sendMessage(chatId, 'Belum ada data absensi yang dicatat.');
        return;
    }

    // Menyiapkan pesan untuk daftar absensi
    let daftarAbsensi = 'Data Absensi:\n';
    for (const userId in kehadiran) {
        const data = kehadiran[userId];
        daftarAbsensi += `User: ${data.username}, Hari: ${data.hari}, Tanggal: ${data.tanggal}, Bulan: ${data.bulan}, Tahun: ${data.tahun}, Jam: ${data.jam}\n`;
    }

    bot.sendMessage(chatId, daftarAbsensi);
});

// Mulai server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});