import express from "express";
import Fund from "../models/fund.js";
import Purchase from "../models/purchases.js";
import Sale from "../models/sales.js";
import Operational from "../models/operational.js";
import PurchaseProduct from "../models/purchaseProduct.js";
import SaleProduct from "../models/saleProduct.js";
import Product from "../models/product.js";
import Supplier from "../models/supplier.js";
import { sequelize } from "../models/model.js";
import { Op, or } from "sequelize";

const router = express.Router();

router.get('/kas', (req, res) => {
    res.render("laporan_kas", { i_user: req.session.user || "" });
});

router.get('/api/purchase/:startDate/:endDate', (req, res) => {
    Purchase.findAll({
        where: {
            OrderDate: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }, Status: {
                [Op.in]: [0, 2]
            }
        },
        include: [
            { model: PurchaseProduct, include: [{ model: Product }] },
            { model: Supplier }
        ]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/sale/:startDate/:endDate', (req, res) => {
    Sale.findAll({
        where: {
            OrderDate: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }
        },
        include: [
            { model: SaleProduct, include: [{ model: Product }] },
        ]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/operational/:startDate/:endDate', (req, res) => {
    Operational.findAll({
        where: {
            Date: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }
        }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/debt/:startDate/:endDate', (req, res) => {
    Purchase.findAll({
        where: {
            OrderDate: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }, Status: 1
        },
        include: [
            { model: PurchaseProduct, include: [{ model: Product }] },
            { model: Supplier }
        ]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/fund/:startDate/:endDate', (req, res) => {
    Fund.findAll({
        where: {
            Date: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }
        }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/next-fund/:startDate/:endDate', (req, res) => {
    Fund.findOne({
        where: {
            Date: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }, Status: 1
        }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.post('/api/fund', (req, res) => {
    Fund.create({ Date: req.body.Date, Total: req.body.Total, Status: req.body.Status }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.put('/api/fund/:id', (req, res) => {
    Fund.update({ Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

export default router;