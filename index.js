import express, { response } from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
//session
import session from 'express-session';
//models
import User from "./models/user.js";
import Supplier from "./models/supplier.js";
import Product from "./models/product.js";
import Operational from "./models/operational.js";
import Purchase from "./models/purchases.js";
import PurchaseProduct from "./models/purchaseProduct.js";
import Fund from "./models/fund.js";
import Sale from "./models/sales.js";
import SaleProduct from "./models/saleProduct.js";
import Debt from "./models/debt.js";
import Retur from "./models/retur.js";
import ReturProduct from "./models/returProduct.js";
import Predict from "./models/predict.js";

//controllers
import { sequelize } from "./models/model.js";
import { Op, where } from "sequelize";


//Router
import RootRouter from './routes/Root.js';
import SupplierRoute from './routes/SupplierRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import PurchaseRoute from './routes/PurchaseRoute.js';
import DebtRoute from './routes/DebtRoute.js';
import OperationalRoute from './routes/OperationalRoute.js';
import FundRoute from './routes/FundRoute.js';
import SaleRoute from './routes/SaleRoute.js';
import ReturRoute from './routes/ReturRoute.js';



const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(FileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//session
app.use(session({
    secret: 'Sinar secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } //1 jam
}));

//Login
app.use('/', RootRouter);
//Supllier
app.use(SupplierRoute);
//Product
app.use(ProductRoute);
//Purchases
app.use(PurchaseRoute);
//Debt
app.use(DebtRoute);
//Operational
app.use(OperationalRoute);
//Fund
app.use(FundRoute);
//Sales
app.use(SaleRoute);
//Retur
app.use(ReturRoute);


//Laporan kas
app.get('/kas', (req, res) => {
    res.render("kas", { i_user: req.session.user || "" });
});

//Prediksi
app.get('/prediksi', (req, res) => {
    Product.findAll().then((pro) => {
        res.render("prediksi", { i_user: req.session.user || "", products: pro });
    })
});

/*Menampilkan user */
app.get('/api/user', (req, res) => {
    User.findAll().then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

//Laporan Kas
app.get('/api/purchase/:startDate/:endDate', (req, res) => {
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

app.get('/api/sale/:startDate/:endDate', (req, res) => {
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

app.get('/api/operational/:startDate/:endDate', (req, res) => {
    Operational.findAll({
        where: {
            Date: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }, Status: {
                [Op.in]: [0, 1]
            }
        }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

app.get('/api/debt/:startDate/:endDate', (req, res) => {
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

app.get('/api/fund/:startDate/:endDate', (req, res) => {
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

app.get('/api/next-fund/:startDate/:endDate', (req, res) => {
    Fund.findOne({
        where: {
            Date: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }, Status: 4
        }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

app.post('/api/fund', (req, res) => {
    Fund.create({ Date: req.body.Date, Total: req.body.Total, Status: req.body.Status }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.put('/api/fund/:id', (req, res) => {
    Fund.update({ Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.get('/api/predict/:kode', async (req, res) => {
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

app.get('/api/predictTrend/:kode/:startDate/:endDate', (req, res) => {
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


/* Membuat tabel di database */
app.get('/api/create_table', (req, res) => {
    sequelize.sync();
    User.sync();
    Supplier.sync();
    Product.sync();
    Operational.sync();
    Purchase.sync();
    PurchaseProduct.sync();
    Fund.sync();
    Debt.sync();
    Predict.sync();
    Retur.sync();
    ReturProduct.sync();
    Sale.sync();
    SaleProduct.sync();
    res.end("Tabel berhasil dibuat");
})

app.get('/res', (req, res) => {
    Debt.findAll({
        include: [
            { model: Purchase, include: [{ model: PurchaseProduct, include: [{ model: Product }] }, { model: Supplier }] }
        ]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
})

app.get('/res2', (req, res) => {
    Operational.findAll({
        include: [
            { model: Fund },
            { model: User }
        ]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

app.listen(port, () => {
    console.log(`Server running at ${hostname}:${port}`);
})