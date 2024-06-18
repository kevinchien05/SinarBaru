import express from "express";
import Product from "../models/product.js";
import Predict from "../models/predict.js";
import { sequelize } from "../models/model.js";
import { Op } from "sequelize";


const router = express.Router();

router.get('/predict', (req, res) => {
    Product.findAll().then((pro) => {
        res.render("prediksi_penjualan", { i_user: req.session.user || "", products: pro });
    })
});

router.get('/api/predict/:kode', async (req, res) => {
    const productCode = req.params.kode;

    try {
        const results = await sequelize.query(
            `
            SELECT DATE_FORMAT(sales.OrderDate, '%M %Y') AS month, 
                   SUM(saleproducts.Qnt) AS totalQuantity
            FROM saleproducts
            JOIN sales ON saleproducts.SalesID = sales.id
            WHERE saleproducts.ProductCode = :productCode
            GROUP BY month
            ORDER BY month DESC
            `,
            {
                replacements: { productCode },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({ status: 200, error: null, Response: results });
    } catch (err) {
        res.json({ status: 502, error: err });
    }
});

router.get('/api/predictTrend/:kode/:startDate/:endDate', (req, res) => {
    Predict.findAll({
        where: {
            ProductCode: req.params.kode,
            Date: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }
        }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

export default router;