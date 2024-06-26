import express from "express";
import Sale from "../models/sales.js";
import SaleProduct from "../models/saleProduct.js";
import Product from "../models/product.js";
import { sequelize } from "../models/model.js";
import moment from "moment";
import { Op } from "sequelize";

const router = express.Router();

router.get('/sale', async (req, res) => {
    try {
        let saleCount = await Sale.count();
        const { sort = 'OrderDate', order = 'ASC', search = '', startDate, endDate } = req.query;

        // Calculate the default date range
        const defaultEndDate = moment().endOf('day').format('YYYY-MM-DD');
        const defaultStartDate = moment().subtract(1, 'years').startOf('day').format('YYYY-MM-DD');

        // Use provided dates or default values
        const displayStartDate = startDate ? moment(startDate).startOf('day').format('YYYY-MM-DD') : defaultStartDate;
        const displayEndDate = endDate ? moment(endDate).endOf('day').format('YYYY-MM-DD') : defaultEndDate;

        const filterStartDate = startDate ? moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss') : moment(defaultStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const filterEndDate = endDate ? moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss') : moment(defaultEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');

        const searchCondition = search ? {
            [Op.or]: [
                { OrderDate: { [Op.like]: `%${search}%` } },
                { Total: { [Op.like]: `%${search}%` } },
                { CustomerName: { [Op.like]: `%${search}%` } },
                { '$SaleProducts.Product.ProductName$': { [Op.like]: `%${search}%` } },
                { '$SaleProducts.Qnt$': { [Op.like]: `%${search}%` } }
            ], OrderDate: {
                [Op.between]: [filterStartDate, filterEndDate]
            }

        } : {
            OrderDate: {
                [Op.between]: [filterStartDate, filterEndDate]
            }
        };

        Sale.findAll({
            where: searchCondition,
            order: [[sort, order]],
            include: [
                { model: SaleProduct, include: [{ model: Product }] }]
        }).then((results) => {
            Product.findAll().then((pro) => {
                res.render("data_penjualan", {
                    i_user: req.session.user || "", sales: results, products: pro, counter: saleCount, sort, order, search, startDate: displayStartDate,
                    endDate: displayEndDate
                });
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.get('/api/sale/:kode', (req, res) => {
    Sale.findOne({
        where: { id: req.params.kode }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

//tambah table purchase
router.post('/api/sale-sales', (req, res) => {
    Sale.create({ id: req.body.id, OrderDate: req.body.OrderDate, Total: req.body.Total, CustomerName: req.body.CustomerName, Description: req.body.Description }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//tambah table purchaseproduct
router.post('/api/sale-saleproducts', (req, res) => {
    SaleProduct.create({ Qnt: req.body.Qnt, Price: req.body.Price,BuyPrice: req.body.BuyPrice, Total: req.body.ProductTotal, SalesID: req.body.SalesID, ProductCode: req.body.ProductCode }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table product
router.put('/api/sale-product/:kode', (req, res) => {
    Product.update({ Qnt: req.body.ProductQnt },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.delete('/api/sale-sales/:id', (req, res) => {
    Sale.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

router.delete('/api/sale-saleproducts/:id', (req, res) => {
    SaleProduct.destroy({ where: { SalesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

export default router;