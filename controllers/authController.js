const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validasi field yang wajib diisi
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, dan password wajib diisi",
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validasi panjang username
    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Username harus memiliki panjang antara 3 hingga 50 karakter",
      });
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal harus memiliki 6 karakter",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingEmail = await User.findByEmail(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // Cek apakah username sudah digunakan
    const existingUsername = await User.findByUsername(trimmedUsername);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username sudah digunakan",
      });
    }

    // Hash password menggunakan bcryptjs (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru ke database
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: newUser,
    });
  } catch (error) {
    console.error("Error register user:", error);

    // Tangani jika terjadi duplikasi dari unique constraint PostgreSQL (code 23505)
    if (error.code === "23505") {
      const detail = error.detail || "";
      if (detail.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Email sudah terdaftar",
        });
      }
      if (detail.includes("username")) {
        return res.status(409).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }
      return res.status(409).json({
        success: false,
        message: "Username atau email sudah digunakan",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat registrasi",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email dan password wajib diisi",
      });
    }

    // Cari user berdasarkan username ATAU email
    const user = await User.findByUsernameOrEmail(username.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username/email atau password salah",
      });
    }

    // Verifikasi password dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username/email atau password salah",
      });
    }

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || "raisaku_jwt_super_secret_key_2026";
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat login",
    });
  }
};
