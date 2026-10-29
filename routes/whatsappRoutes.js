const express = require("express");
const router = express.Router();
const Setting = require("../models/settingModel");

function formatWaNumber(raw) {
  let number = (raw || "").trim();
  // Bersihkan karakter non-digit (seperti +, spasi, tanda minus)
  number = number.replace(/\D/g, "");
  // Jika diawali 0, ubah jadi 62
  if (number.startsWith("0")) {
    number = "62" + number.slice(1);
  }
  return number;
}

async function getWaNumber() {
  const dbNumber = await Setting.get("whatsapp_number");
  return formatWaNumber(dbNumber || process.env.WHATSAPP_NUMBER || "628123456789");
}

// 1. Endpoint redirect ke WhatsApp saat diklik dari katalog
router.get("/redirect", async (req, res) => {
  try {
    const { text } = req.query;
    const waNumber = await getWaNumber();
    const encodedText = encodeURIComponent(text || "");
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    return res.redirect(302, waUrl);
  } catch (error) {
    console.error("Error redirect WhatsApp:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengalihkan ke WhatsApp",
    });
  }
});

// 2. Endpoint get link JSON
router.get("/link", async (req, res) => {
  try {
    const { text } = req.query;
    const waNumber = await getWaNumber();
    const encodedText = encodeURIComponent(text || "");
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    return res.status(200).json({
      success: true,
      url: waUrl,
    });
  } catch (error) {
    console.error("Error get WhatsApp link:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat tautan WhatsApp",
    });
  }
});

// 3. Endpoint untuk membaca pengaturan nomor WA saat ini (untuk admin di dashboard)
router.get("/settings", async (req, res) => {
  try {
    const waNumber = await getWaNumber();
    return res.status(200).json({
      success: true,
      data: {
        whatsapp_number: waNumber,
      },
    });
  } catch (error) {
    console.error("Error get WhatsApp settings:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pengaturan WhatsApp",
    });
  }
});

// 4. Endpoint untuk mengupdate nomor WA dari Dashboard Admin
router.put("/settings", async (req, res) => {
  try {
    const { whatsapp_number } = req.body;

    if (!whatsapp_number) {
      return res.status(400).json({
        success: false,
        message: "Nomor WhatsApp wajib diisi",
      });
    }

    const formatted = formatWaNumber(whatsapp_number);

    if (formatted.length < 9 || formatted.length > 16) {
      return res.status(400).json({
        success: false,
        message: "Format nomor WhatsApp tidak valid (minimal 9 digit)",
      });
    }

    await Setting.set("whatsapp_number", formatted);

    return res.status(200).json({
      success: true,
      message: "Nomor WhatsApp toko berhasil diperbarui",
      data: {
        whatsapp_number: formatted,
      },
    });
  } catch (error) {
    console.error("Error update WhatsApp settings:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui nomor WhatsApp",
    });
  }
});

module.exports = router;
