import express from "express";
import Product from "../models/product.js";
import { sequelize } from "../models/model.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get('/product', async (req, res) => {
    try {
        let productCount = await Product.count();
        const { sort = 'ProductCode', order = 'ASC', search = '' } = req.query;

        const searchCondition = search ? {
            [Op.or]: [
                {ProductCode: {[Op.like]: `%${search}%`}},
                {ProductName: {[Op.like]: `%${search}%`}},
                {Qnt: {[Op.like]: `%${search}%`}},
                {Unit: {[Op.like]: `%${search}%`}},
                {BuyPrice: {[Op.like]: `%${search}%`}},
                {SellPrice: {[Op.like]: `%${search}%`}}
            ]

        } : {};

        Product.findAll(
            {
                where: searchCondition,
                order: [[sort,order]]
            }
        ).then((results) => {
            res.render("stok_barang", { i_user: req.session.user || "", products: results, counter: productCount, sort, order, search });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.get('/api/stok/:kode',  (req, res) => {
    Product.findOne({
        where: { ProductCode: req.params.kode }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.post('/api/stok', async (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: "No File Uploaded" });
    const ProductCode = req.body.ProductCode;
    const ProductName = req.body.ProductName;
    const SellPrice = req.body.SellPrice;
    const BuyPrice = req.body.BuyPrice;
    const Qnt = req.body.Qnt;
    const Unit = req.body.Unit;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png', '.jpg', '.jpeg'];

    if (!allowedType.includes(ext.toLowerCase())) return res.json({ msg: "Format Gambar Harus JPG, JPEG, PNG" });
    if (fileSize > 5000000) return res.json({ msg: "Ukuran Gambar Harus Dibawah 5 MB" });

    const existingProduct = await Product.findOne({where: {ProductName: ProductName}});
    const checkImage = await Product.findOne({where: {Image: fileName}});
    if(existingProduct){
        return res.json({ msg: "Data Sudah Ada" });
    }
    if(checkImage){
        return res.json({ msg: "Gambar Sudah Ada" });
    }
    const name = /^[a-zA-Z0-9][a-zA-Z0-9\s]+$/
    const regex = /^[A-Za-z][a-zA-Z\s]+$/;
    const num = /^[0-9]+$/;
    if(!name.test(ProductName)){
        return res.json({ msg: "Nama Produk Hanya Huruf dan Angka " });
    }
    if(!regex.test(Unit)){
        return res.json({ msg: "Satuan Wajib Huruf " });
    }
    if(!num.test(SellPrice)){
        return res.json({ msg: "Harga Wajib Angka " });
    }

    file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) return res.status(500).json({ msg: err.message });
        try {
            await Product.create({ ProductCode: ProductCode, ProductName: ProductName, SellPrice: SellPrice, Image: fileName, Url: url, Qnt: Qnt, BuyPrice: BuyPrice, Unit: Unit });
            res.status(201).json({ msg: "" });
        } catch (error) {
            console.log(error.message);
        }
    })
});

router.put('/api/stok/:kode', async (req, res) => {
    const product = await Product.findOne({
        where: {
            ProductCode: req.params.kode
        }
    });
    if (!product) return res.status(404).json({ msg: "No Data Found" });

    const ProductName = req.body.EProductName;
    const SellPrice = req.body.ESellPrice;
    const Unit = req.body.EUnit;
    const name = /^[a-zA-Z0-9][a-zA-Z0-9\s]+$/
    const regex = /^[A-Za-z][a-zA-Z\s]+$/;
    const num = /^[0-9]+$/;
    if(!name.test(ProductName)){
        return res.json({ msg: "Nama Produk Hanya Huruf dan Angka " });
    }
    if(!regex.test(Unit)){
        return res.json({ msg: "Satuan Wajib Huruf " });
    }
    if(!num.test(SellPrice)){
        return res.json({ msg: "Harga Wajib Angka " });
    }
    let fileName = "";
    if (req.files === null) {
        fileName = product.Image;
    } else {
        const file = req.files.Efile;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];

        if (!allowedType.includes(ext.toLowerCase())) return res.json({ msg: "Format Gambar Harus JPG, JPEG, PNG" });
        if (fileSize > 5000000) return res.json({ msg: "Ukuran Gambar Harus Dibawah 5 MB" });

        const filepath = `./public/images/${product.Image}`;
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
        });
    }
    
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        await Product.update({ ProductName: ProductName, SellPrice: SellPrice, Unit: Unit ,Image: fileName, Url: url }, {
            where: {
                ProductCode: req.params.kode
            }
        });
        res.status(200).json({ msg: "" });
    } catch (error) {
        console.log(error.message);
    }
});

router.delete('/api/stok/:kode', async (req, res) => {
    const product = await Product.findOne({
        where: {
            ProductCode: req.params.kode
        }
    });
    if (!product) return res.status(404).json({ msg: "No Data Found" });

    try {
        const filepath = `./public/images/${product.Image}`;
        fs.unlinkSync(filepath);
        await Product.destroy({
            where: {
                ProductCode: req.params.kode
            }
        });
        res.status(200).json({ msg: "Product Deleted Successfuly" });
    } catch (error) {
        console.log(error.message);
    }
});


export default router;