const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middlewares/upload");

router.get("/", productController.getProducts);
router.post("/", upload.single("image"), productController.createProduct);

module.exports = router;
