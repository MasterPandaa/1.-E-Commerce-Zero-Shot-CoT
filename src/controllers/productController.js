const fs = require("fs");
const path = require("path");
const { sanitizeObject } = require("../utils/sanitize");
const { parsePagination } = require("../utils/pagination");
const { slugify } = require("../utils/slug");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const { query, pool } = require("../config/db");

exports.list = async (req, res, next) => {
  try {
    const { q, category, price_min, price_max } = req.query;
    const { page, limit, offset } = parsePagination(req.query);
    const out = await productModel.listProducts({
      q,
      category_slug: category,
      price_min: price_min !== undefined ? Number(price_min) : undefined,
      price_max: price_max !== undefined ? Number(price_max) : undefined,
      offset,
      limit,
    });
    res.json({ data: out.rows, pagination: { page, limit, total: out.count } });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = sanitizeObject(req.body);
    const { name, description, price, stock, category_id } = body;
    if (category_id) {
      const cat = await categoryModel.findById(Number(category_id));
      if (!cat) return res.status(400).json({ message: "Invalid category" });
    }
    const slugBase = slugify(name);
    let slug = slugBase;
    // Ensure unique slug by appending number if needed
    let counter = 1;
    while (true) {
      const rows = await query(
        "SELECT id FROM products WHERE slug = ? LIMIT 1",
        [slug],
      );
      if (!rows[0]) break;
      slug = `${slugBase}-${counter++}`;
    }
    const image_url = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;
    const product = await productModel.createProduct({
      name,
      slug,
      description,
      price: Number(price),
      stock: Number(stock || 0),
      image_url,
      category_id: category_id ? Number(category_id) : null,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await productModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const body = sanitizeObject(req.body);
    const fields = {};
    if (body.name) fields.name = body.name;
    if (body.description !== undefined) fields.description = body.description;
    if (body.price !== undefined) fields.price = Number(body.price);
    if (body.stock !== undefined) fields.stock = Number(body.stock);
    if (body.category_id !== undefined) {
      fields.category_id = Number(body.category_id) || null;
    }
    if (body.is_active !== undefined) {
      fields.is_active = Number(body.is_active) ? 1 : 0;
    }

    if (body.name && body.name !== existing.name) {
      const slugBase = slugify(body.name);
      let slug = slugBase;
      let counter = 1;
      while (true) {
        const rows = await query(
          "SELECT id FROM products WHERE slug = ? AND id <> ? LIMIT 1",
          [slug, id],
        );
        if (!rows[0]) break;
        slug = `${slugBase}-${counter++}`;
      }
      fields.slug = slug;
    }

    if (req.file) {
      fields.image_url = `/uploads/products/${req.file.filename}`;
      if (existing.image_url) {
        const rel = existing.image_url.replace(/^\\+|^\/+/, "");
        const filePath = path.join(__dirname, "..", "..", rel);
        fs.unlink(filePath, () => {});
      }
    }

    const updated = await productModel.updateProduct(id, fields);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await productModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (existing.image_url) {
      const rel = existing.image_url.replace(/^\\+|^\/+/, "");
      const filePath = path.join(__dirname, "..", "..", rel);
      fs.unlink(filePath, () => {});
    }
    await productModel.deleteProduct(id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

exports.categories = async (req, res, next) => {
  try {
    const rows = await categoryModel.listAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
