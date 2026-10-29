const Product = require("../models/productModel");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const productData = {
      category_id,
      name,
      description,
      price,
      image: imageUrl,
    };

    const newProduct = await Product.create(productData);

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error create product:", error);
    res.status(500).json({ success: false, message: "Gagal menambah produk" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, is_available } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const productData = {};
    if (category_id !== undefined) productData.category_id = category_id;
    if (name !== undefined) productData.name = name;
    if (description !== undefined) productData.description = description;
    if (price !== undefined) productData.price = price;
    if (is_available !== undefined) productData.is_available = is_available;
    if (imageUrl) productData.image = imageUrl;

    const updatedProduct = await Product.update(id, productData);

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Produk tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengupdate produk" });
  }
};
