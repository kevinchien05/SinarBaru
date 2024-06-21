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

router.get('/purchase', async (req, res) => {
    try {
        let purchaseCount = await Purchase.count();
        const { sort = 'OrderDate', order = 'ASC', search = '', startDate, endDate } = req.query;

        // Calculate the default date range
        const defaultEndDate = moment().endOf('day').format('YYYY-MM-DD');
        const defaultStartDate = moment().subtract(1, 'years').startOf('day').format('YYYY-MM-DD');

        // Use provided dates or default values
        const filterStartDate = startDate ? moment(startDate).startOf('day').format('YYYY-MM-DD') : defaultStartDate;
        const filterEndDate = endDate ? moment(endDate).endOf('day').format('YYYY-MM-DD') : defaultEndDate;


        const searchCondition = search ? {
            [Op.or]: [
                { OrderDate: { [Op.like]: `%${search}%` } },
                { Total: { [Op.like]: `%${search}%` } },
                { '$Supplier.SupplierName$': { [Op.like]: `%${search}%` } },
                { '$PurchaseProducts.Product.ProductName$': { [Op.like]: `%${search}%` } },
                { '$PurchaseProducts.Qnt$': { [Op.like]: `%${search}%` } }
            ], Status: {
                [Op.in]: [0, 1,2]
            }, OrderDate: {
                [Op.between]: [filterStartDate, filterEndDate]
            }

        } : {
            Status: {
                [Op.in]: [0, 1,2]
            }, OrderDate: {
                [Op.between]: [filterStartDate, filterEndDate]
            }
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
                    res.render("data_pembelian", {
                        i_user: req.session.user || "", purchases: results, suppliers: sup, products: pro, counter: purchaseCount, sort, order, search, startDate: filterStartDate,
                        endDate: filterEndDate
                    });
                })
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.get('/api/purchase/:kode',  (req, res) => {
    Purchase.findOne({
        where: { id: req.params.kode }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

//tambah table purchase
router.post('/api/purchase-purchases', (req, res) => {
    Purchase.create({ id: req.body.id, OrderDate: req.body.OrderDate, Total: req.body.Total, Status: req.body.Status, SupplierID: req.body.SupplierID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//tambah table purchaseproduct
router.post('/api/purchase-purchaseproducts', (req, res) => {
    PurchaseProduct.create({ Qnt: req.body.Qnt, Price: req.body.Price, Total: req.body.ProductTotal, PurchasesID: req.body.PurchasesID, ProductCode: req.body.ProductCode }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table product
router.put('/api/purchase-product/:kode', (req, res) => {
    Product.update({ Qnt: req.body.ProductQnt, BuyPrice: req.body.BuyPrice },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.delete('/api/purchase-purchases/:id', (req, res) => {
    Purchase.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

router.delete('/api/purchase-debt/:id', (req, res) => {
    Debt.destroy({ where: { PurchasesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

router.delete('/api/purchase-purchaseproducts/:id', (req, res) => {
    PurchaseProduct.destroy({ where: { PurchasesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

export default router;