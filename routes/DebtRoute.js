import express from "express";
import Purchase from "../models/purchases.js";
import PurchaseProduct from "../models/purchaseProduct.js";
import Product from "../models/product.js";
import Supplier from "../models/supplier.js";
import Debt from "../models/debt.js";
import { sequelize } from "../models/model.js";
import moment from "moment";
import { Op } from "sequelize";

const router = express.Router();

router.get('/debt', async (req, res) => {
    try {
        const { sort = 'OrderDate', order = 'ASC', search = '' } = req.query;

        const searchCondition = search ? {
            [Op.or]: [
                { OrderDate: { [Op.like]: `%${search}%` } },
                { Total: { [Op.like]: `%${search}%` } },
                { '$Supplier.SupplierName$': { [Op.like]: `%${search}%` } },
                { '$PurchaseProducts.Product.ProductName$': { [Op.like]: `%${search}%` } },
                { '$PurchaseProducts.Qnt$': { [Op.like]: `%${search}%` } }
            ], Status: 1
        } : {
            Status: 1
        };


        const orderCondition = sort === 'supplierName'
            ? [[{ model: Supplier }, 'SupplierName', order]]
            : [[sort, order]];

        Purchase.findAll({
            where: searchCondition,
            order: orderCondition,
            include: [
                { model: PurchaseProduct, include: [{ model: Product }] },
                { model: Supplier }]
        }).then((results) => {
            Supplier.findAll().then((sup) => {
                Product.findAll().then((pro) => {
                    res.render("utang", {
                        i_user: req.session.user || "", purchases: results, suppliers: sup, products: pro, sort, order, search
                    });
                })
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.get('/debtHistory', (req, res) => {
    const { sort = 'PayDate', order = 'ASC', search = '' } = req.query;

    const searchCondition = search ? {
        [Op.or]: [
            { PayDate: { [Op.like]: `%${search}%` } },
            { '$Purchase.Total$': { [Op.like]: `%${search}%` } },
            { '$Purchase.OrderDate$': { [Op.like]: `%${search}%` } },
            { '$Purchase.Supplier.SupplierName$': { [Op.like]: `%${search}%` } },
            { '$Purchase.PurchaseProducts.Product.ProductName$': { [Op.like]: `%${search}%` } },
            { '$Purchase.PurchaseProducts.Qnt$': { [Op.like]: `%${search}%` } }
        ]
    } : {};


    const orderCondition = sort === 'supplierName'
        ? [[{ model: Purchase }, { model: Supplier }, 'SupplierName', order]]
        : sort === 'total' ? [[{ model: Purchase }, 'Total', order]] : sort === 'pelunasan' ? [[{ model: Purchase }, 'OrderDate', order]] : [[sort, order]];

    Debt.findAll({
        where: searchCondition,
        order: orderCondition,
        include: [
            { model: Purchase, include: [{ model: PurchaseProduct, include: [{ model: Product }] }, { model: Supplier }] }
        ]
    }).then((results) => {
        res.render("riwayat_utang", {
            i_user: req.session.user || "", debts: results, sort, order, search
        });
    });
});

router.put('/api/debt/:id', (req, res) => {
    Purchase.update({ Status: req.body.Status, OrderDate: req.body.OrderDate },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.post('/api/debt', (req, res) => {
    Debt.create({ PayDate: req.body.PayDate, PurchasesID: req.body.PurchasesID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

export default router;