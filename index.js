import express, { response } from "express";
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

//controllers
import user_controller from './controllers/user.js';
import { sequelize } from "./models/model.js";
import { Op, where } from "sequelize";
import Predict from "./models/predict.js";




const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.use(express.json());
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

// ==* Route EJS using controllers *==
app.get('/login', user_controller.login);
app.post('/login', user_controller.auth);
app.get('/logout', user_controller.logout);


//Home Page
app.get('/', (req, res) => {
    res.render("index", { i_user: req.session.user || "" });
});

//Supplier Page
app.get('/supplier', (req, res) => {
    Supplier.findAll().then((results) => {
        res.render("supplier", { i_user: req.session.user || "", suppliers: results });
    });
});

//Product Page
app.get('/product', async (req, res) => {
    try {
        let productCount = await Product.count();
        Product.findAll().then((results) => {
            res.render("product", { i_user: req.session.user || "", products: results, counter: productCount });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

//Operational
app.get('/operational', async (req, res) => {
    try {
        let operationalCount = await Operational.count();
        Operational.findAll({
            include: [{ model: User }]
        }).then((results) => {
            res.render("operational", { i_user: req.session.user || "", operationals: results, counter: operationalCount });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }

});

//dept
app.get('/debt', async (req, res) => {
    try {
        Purchase.findAll({
            where: { Status: 1 },
            include: [
                { model: PurchaseProduct, include: [{ model: Product }] },
                { model: Supplier }]
        }).then((results) => {
            res.render("debt", { i_user: req.session.user || "", purchases: results });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

app.get('/debtHistory', (req, res) => {
    Debt.findAll({
        include: [
            { model: Purchase, include: [{ model: PurchaseProduct, include: [{ model: Product }] }, { model: Supplier }] }
        ]
    }).then((results) => {
        res.render("debtHis", { i_user: req.session.user || "", debts: results });
    });
});

//Purchases
app.get('/purchase', async (req, res) => {
    try {
        let purchaseCount = await Purchase.count();
        Purchase.findAll({
            where: {
                Status: {
                    [Op.in]: [0, 2]
                }
            },
            include: [
                { model: PurchaseProduct, include: [{ model: Product }] },
                { model: Supplier }]
        }).then((results) => {
            Supplier.findAll().then((sup) => {
                Product.findAll().then((pro) => {
                    res.render("purchase", { i_user: req.session.user || "", purchases: results, suppliers: sup, products: pro, counter: purchaseCount });
                })
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

//Sales
app.get('/sale', async (req, res) => {
    try {
        let saleCount = await Sale.count();
        Sale.findAll({
            include: [
                { model: SaleProduct, include: [{ model: Product }] }]
        }).then((results) => {
            Product.findAll().then((pro) => {
                res.render("sale", { i_user: req.session.user || "", sales: results, products: pro, counter: saleCount });
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

//Retur
app.get('/retur', async (req, res) => {
    try {
        let returCount = await Retur.count();
        Retur.findAll({
            include: [
                { model: ReturProduct, include: [{ model: Product }] },
                { model: Supplier }]
        }).then((results) => {
            Supplier.findAll().then((sup) => {
                Product.findAll().then((pro) => {
                    res.render("retur", { i_user: req.session.user || "", returs: results, suppliers: sup, products: pro, counter: returCount });
                })
            })
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

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

//Supplier
app.get('/api/supplier', (req, res) => {
    Supplier.findAll().then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

app.post('/api/supplier', (req, res) => {
    Supplier.create({ SupplierName: req.body.SupplierName, PhoneNumber: req.body.PhoneNumber, Address: req.body.Address }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.put('/api/supplier/:id', (req, res) => {
    Supplier.update({ SupplierName: req.body.SupplierName, PhoneNumber: req.body.PhoneNumber, Address: req.body.Address },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.delete('/api/supplier/:id', (req, res) => {
    Supplier.destroy({ where: { id: req.params.id } }
    ).then(() => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

//Stok
app.post('/api/stok', (req, res) => {
    Product.create({ ProductCode: req.body.ProductCode, ProductName: req.body.ProductName, SellPrice: req.body.SellPrice, Qnt: req.body.Qnt, BuyPrice: req.body.BuyPrice }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.put('/api/stok/:kode', (req, res) => {
    Product.update({ ProductName: req.body.ProductName, SellPrice: req.body.SellPrice },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.delete('/api/stok/:kode', (req, res) => {
    Product.destroy({ where: { ProductCode: req.params.kode } }
    ).then(() => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

//Operational
app.post('/api/operational', (req, res) => {
    Operational.create({ id: req.body.id, Date: req.body.Date, Description: req.body.Description, Total: req.body.Total, Status: req.body.Status, UserID: req.body.UserID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.put('/api/operational/:id', (req, res) => {
    Operational.update({ Date: req.body.Date, Description: req.body.Description, Total: req.body.Total, Status: req.body.Status },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.delete('/api/operational/:id', (req, res) => {
    Operational.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

app.post('/api/fund', (req, res) => {
    Fund.create({ Date: req.body.Date, Total: req.body.Total, Status: req.body.Status, OperationalID: req.body.OperationalID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//Purchase
//tambah table purchase
app.post('/api/purchase-purchases', (req, res) => {
    Purchase.create({ id: req.body.id, OrderDate: req.body.OrderDate, Total: req.body.Total, Status: req.body.Status, SupplierID: req.body.SupplierID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//tambah table purchaseproduct
app.post('/api/purchase-purchaseproducts', (req, res) => {
    PurchaseProduct.create({ Qnt: req.body.Qnt, Price: req.body.Price, Total: req.body.ProductTotal, PurchasesID: req.body.PurchasesID, ProductCode: req.body.ProductCode }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table product
app.put('/api/purchase-product/:kode', (req, res) => {
    Product.update({ Qnt: req.body.ProductQnt, BuyPrice: req.body.BuyPrice },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.delete('/api/purchase-purchases/:id', (req, res) => {
    Purchase.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

app.delete('/api/purchase-debt/:id', (req, res) => {
    Debt.destroy({ where: { PurchasesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

app.delete('/api/purchase-purchaseproducts/:id', (req, res) => {
    PurchaseProduct.destroy({ where: { PurchasesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

//debt
app.put('/api/debt/:id', (req, res) => {
    Purchase.update({ Status: req.body.Status, OrderDate: req.body.OrderDate },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.post('/api/debt', (req, res) => {
    Debt.create({ Date: req.body.Date, PurchasesID: req.body.PurchasesID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
})

//Sale
//tambah table purchase
app.post('/api/sale-sales', (req, res) => {
    Sale.create({ id: req.body.id, OrderDate: req.body.OrderDate, Total: req.body.Total }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//tambah table purchaseproduct
app.post('/api/sale-saleproducts', (req, res) => {
    SaleProduct.create({ Qnt: req.body.Qnt, Price: req.body.Price, Total: req.body.ProductTotal, SalesID: req.body.SalesID, ProductCode: req.body.ProductCode }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table product
app.put('/api/sale-product/:kode', (req, res) => {
    Product.update({ Qnt: req.body.ProductQnt },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

app.delete('/api/sale-sales/:id', (req, res) => {
    Sale.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

app.delete('/api/sale-saleproducts/:id', (req, res) => {
    SaleProduct.destroy({ where: { SalesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

//Retur
app.get('/api/retur/:id/:date', async (req, res) => {
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
app.post('/api/retur-purchases', (req, res) => {
    Retur.create({ id: req.body.id, ReturDate: req.body.ReturDate, Total: req.body.Total, SupplierID: req.body.SupplierID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//tambah table returproducts
app.post('/api/retur-returproducts', (req, res) => {
    ReturProduct.create({ Qnt: req.body.Qnt, Price: req.body.Price, Total: req.body.ProductTotal, ReturID: req.body.ReturID, ProductCode: req.body.ProductCode }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table product
app.put('/api/retur-product/:kode', (req, res) => {
    Product.update({ Qnt: req.body.ProductQnt, BuyPrice: req.body.BuyPrice },
        { where: { ProductCode: req.params.kode } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table purchase
app.put('/api/retur-purchase/:id', (req, res) => {
    Purchase.update({ Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

//update table purchase
app.put('/api/retur-purchaseproduct/:id', (req, res) => {
    PurchaseProduct.update({ Qnt: req.body.Qnt, Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
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

app.get('/res3', (req, res) => {
    Purchase.findAll({
        where: { Status: 1 },
        include: [
            { model: PurchaseProduct, include: [{ model: Product }] },
            { model: Supplier }]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

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