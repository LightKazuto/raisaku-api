const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error get user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Pastikan user ada di database
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const updateData = {};

    // Validasi dan siapkan update username jika dikirim
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Username harus memiliki panjang antara 3 hingga 50 karakter",
        });
      }

      // Cek apakah username sudah digunakan user lain
      const duplicateUsername = await User.findByUsernameExcludingId(
        trimmedUsername,
        id
      );
      if (duplicateUsername) {
        return res.status(409).json({
          success: false,
          message: "Username sudah digunakan oleh user lain",
        });
      }

      updateData.username = trimmedUsername;
    }

    // Validasi dan siapkan update email jika dikirim
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }

      // Cek apakah email sudah terdaftar oleh user lain
      const duplicateEmail = await User.findByEmailExcludingId(trimmedEmail, id);
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "Email sudah terdaftar oleh user lain",
        });
      }

      updateData.email = trimmedEmail;
    }

    // Jika update password, lakukan hashing dengan bcryptjs
    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password baru minimal harus memiliki 6 karakter",
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Jika tidak ada field yang dikirim untuk diupdate
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang dikirim untuk diperbarui",
      });
    }

    // Jalankan update
    const updatedUser = await User.update(id, updateData);

    res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error update user:", error);

    // Tangani jika terjadi duplikasi dari unique constraint PostgreSQL (code 23505)
    if (error.code === "23505") {
      const detail = error.detail || "";
      if (detail.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Email sudah terdaftar oleh user lain",
        });
      }
      if (detail.includes("username")) {
        return res.status(409).json({
          success: false,
          message: "Username sudah digunakan oleh user lain",
        });
      }
      return res.status(409).json({
        success: false,
        message: "Username atau email sudah digunakan",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat memperbarui user",
    });
  }
};
