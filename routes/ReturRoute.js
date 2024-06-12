import express from "express";
import Retur from "../models/retur.js";
import ReturProduct from "../models/returProduct.js";
import Purchase from "../models/purchases.js";
import PurchaseProduct from "../models/purchaseProduct.js";
import Product from "../models/product.js";
import Supplier from "../models/supplier.js";
import { sequelize } from "../models/model.js";
import moment from "moment";
import { Op } from "sequelize";

const router = express.Router();

router.get('/retur', async (req, res) => {
    try {
        let returCount = await Retur.count();
        const { sort = 'ReturDate', order = 'ASC', search = ''} = req.query;
        
        const searchCondition = search ? {
            [Op.or]: [
                { ReturDate: { [Op.like]: `%${search}%` } },
                { Total: { [Op.like]: `%${search}%` } },
                { '$Supplier.SupplierName$': { [Op.like]: `%${search}%` } },
                { '$ReturProducts.Product.ProductName$': { [Op.like]: `%${search}%` } },
                { '$ReturProducts.Qnt$': { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const orderCondition = sort === 'supplierName'
            ? [[{ model: Supplier }, 'SupplierName', order]]
            : [[sort, order]];
        
        Retur.findAll({
            where: searchCondition,
            order: orderCondition,
            include: [
                { model: ReturProduct, include: [{ model: Product }] },
                { model: Supplier }, { model: Purchase }]
        }).then((results) => {
            Supplier.findAll().then((sup) => {
                Product.findAll().then((pro) => {
                    res.render("retur_pembelian", { i_user: req.session.user || "", returs: results, suppliers: sup, products: pro, counter: returCount, sort, order, search });
                })
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.get('/api/retur/:kode', (req, res) => {
    Retur.findOne({
        where: { id: req.params.kode }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/retur/:id/:date', async (req, res) => {
    try {
        await Purchase.findAll({
            where: {
                SupplierID: req.params.id, OrderDate: {
                    [Op.eq]: new Date(req.params.date)
                }
            }, include: [{ model: PurchaseProduct, include: [{ model: Product }] }]
        }).then((results) => {
            res.json({ status: 200, error: null, response: results });
        })
    } catch (error) {
        res.json({ status: 500, error: error, response: {} });
    }

});

//tambah table returpurchases
router.post('/api/retur-purchases', (req, res) => {
    Retur.create({ id: req.body.id, ReturDate: req.body.ReturDate, Total: req.body.Total, SupplierID: req.body.SupplierID, PurchasesID: req.body.PurchasesID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//tambah table returproducts
router.post('/api/retur-returproducts', (req, res) => {
    ReturProduct.create({ Qnt: req.body.Qnt, Price: req.body.Price, Total: req.body.ProductTotal, ReturID: req.body.ReturID, ProductCode: req.body.ProductCode }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table product
router.put('/api/retur-product/:kode', (req, res) => {
    Product.update({ Qnt: req.body.ProductQnt, BuyPrice: req.body.BuyPrice },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table purchase
router.put('/api/retur-purchase/:id', (req, res) => {
    Purchase.update({ Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table purchase
router.put('/api/retur-purchaseproduct/:id', (req, res) => {
    PurchaseProduct.update({ Qnt: req.body.Qnt, Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

export default router;