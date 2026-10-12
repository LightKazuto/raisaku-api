const Product = require("../models/productModel");

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
    const image = req.file ? req.file.path : null;
    const productData = { category_id, name, description, price, image };
    const newProduct = await Product.create(productData);

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal menambah produk" });
  }
};
