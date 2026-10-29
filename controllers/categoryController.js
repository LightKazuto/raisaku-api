const Category = require("../models/categoryModel");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error get categories:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil daftar kategori" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.getById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error get category by id:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const trimmedName = name.trim();

    // Cek duplikasi nama kategori
    const existing = await Category.getByName(trimmedName);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Kategori "${trimmedName}" sudah ada`,
      });
    }

    const newCategory = await Category.create({
      name: trimmedName,
      description: description ? description.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error create category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan kategori baru",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.getById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    const updateData = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Nama kategori tidak boleh kosong",
        });
      }

      // Cek apakah nama sudah digunakan oleh kategori lain
      const duplicate = await Category.getByNameExcludingId(trimmedName, id);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Kategori "${trimmedName}" sudah ada`,
        });
      }

      updateData.name = trimmedName;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    const updated = await Category.update(id, updateData);

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error update category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui kategori",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.getById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah masih ada produk yang menggunakan kategori ini
    const productCount = await Category.countProducts(id);
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${productCount} produk`,
      });
    }

    await Category.delete(id);

    res.status(200).json({
      success: true,
      message: `Kategori "${category.name}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error delete category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori",
    });
  }
};
