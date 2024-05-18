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

//controllers
import user_controller from './controllers/user.js';
import { sequelize } from "./models/model.js";


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
app.get('/operational', (req, res) => {
    Operational.findAll({
        include: [{ model: User }]
    }).then((results) => {
        res.render("operational", { i_user: req.session.user || "", operationals: results });
    });
});

//Purchases
app.get('/res3', (req, res) => {
    Purchase.findAll({
        include: [
            { model: PurchaseProduct, include: [{ model: Product }] },
            { model: Supplier }]
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

app.get('/purchase', async (req, res) => {
    try {
        let purchaseCount = await Purchase.count();
        Purchase.findAll({
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
    Product.create({ ProductCode: req.body.ProductCode, ProductName: req.body.ProductName, SellPrice: req.body.SellPrice, Qnt: req.body.Qnt, BuyPrice: req.body.BuyPrice}
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
    Operational.create({ Date: req.body.Date, Description: req.body.Description, Total: req.body.Total, Status: req.body.Status, UserID: req.body.UserID }
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

//Purchase
//tambah table purchase
app.post('/api/purchase-purchases', (req, res) => {
    Purchase.create({id: req.body.id, OrderDate: req.body.OrderDate, Total: req.body.Total, Status: req.body.Status, SupplierID: req.body.SupplierID }
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

app.delete('/api/purchase-purchaseproducts/:id', (req, res) => {
    PurchaseProduct.destroy({ where: { PurchasesID: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
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
    res.end("Tabel berhasil dibuat");
})

app.listen(port, () => {
    console.log(`Server running at ${hostname}:${port}`);
})