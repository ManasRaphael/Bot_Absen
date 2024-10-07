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
