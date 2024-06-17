import express from "express";
import Fund from "../models/fund.js";
import Purchase from "../models/purchases.js";
import Sale from "../models/sales.js";
import Operational from "../models/operational.js";
import PurchaseProduct from "../models/purchaseProduct.js";
import SaleProduct from "../models/saleProduct.js";
import Product from "../models/product.js";
import Supplier from "../models/supplier.js";
import Retur from "../models/retur.js";
import ReturProduct from "../models/returProduct.js";
import { sequelize } from "../models/model.js";
import { Op, or } from "sequelize";
import moment from "moment";

const router = express.Router();

router.get('/kas', (req, res) => {
    res.render("laporan_kas", { i_user: req.session.user || "" });
});

router.get('/api/purchase/:startDate/:endDate', async (req, res) => {
    const purchases = await Purchase.findAll({
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
    });
    const monthlyTotals = {};
    const returPromises = purchases.map(async (purchase) => {
        const returs = await Retur.findAll({
            where: {
                PurchasesID: purchase.id
            }
        });
        const month = moment(purchase.OrderDate).format('YYYY-MM');
        if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
        }
        monthlyTotals[month] += parseInt(purchase.Total);

        returs.forEach((retur) => {
            monthlyTotals[month] += parseInt(retur.Total);
        })
    });
    await Promise.all(returPromises);
    res.json({ status: 200, error: null, response: purchases, total: monthlyTotals });
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
        const monthlyTotals = {};

        results.forEach((sale) => {
            const month = moment(sale.OrderDate).format('YYYY-MM');

            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += parseInt(sale.Total);
        })
        res.json({ status: 200, error: null, response: results, total: monthlyTotals });
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
        const monthlyTotals = {};

        results.forEach((operational) => {
            const month = moment(operational.Date).format('YYYY-MM');

            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += parseInt(operational.Total);
        })
        res.json({ status: 200, error: null, response: results, total: monthlyTotals });
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
        const monthlyTotals = {};

        results.forEach((debt) => {
            const month = moment(debt.OrderDate).format('YYYY-MM');

            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += parseInt(debt.Total);
        })
        res.json({ status: 200, error: null, response: results, total: monthlyTotals });
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
        const monthlyTotals = {};

        results.forEach((fund) => {
            const month = moment(fund.Date).format('YYYY-MM');

            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += parseInt(fund.Total);
        })
        res.json({ status: 200, error: null, response: results, total: monthlyTotals });
    });
});

router.get('/api/retur-kas/:startDate/:endDate', (req, res) => {
    Retur.findAll({
        where: {
            ReturDate: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }
        },
        include: [
            { model: ReturProduct, include: [{ model: Product }] },
            { model: Supplier }, { model: Purchase }
        ]
    }).then((results) => {
        const monthlyTotals = {};

        results.forEach((retur) => {
            const month = moment(retur.ReturDate).format('YYYY-MM');

            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += parseInt(retur.Total);
        })
        res.json({ status: 200, error: null, response: results, total: monthlyTotals });
    });
});

router.get('/api/retur-kas/:kode', (req, res) => {
    Retur.findAll({
        where: { PurchasesID: req.params.kode },
        include: [
            { model: ReturProduct, include: [{ model: Product }] },
            { model: Supplier }, { model: Purchase }
        ]
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