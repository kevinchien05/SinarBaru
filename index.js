import express, { response } from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
//session
import session from 'express-session';

//controllers
import { sequelize } from "./models/model.js";

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
import PredictRoute from './routes/PredictRoute.js';
import KasRoute from './routes/KasRoute.js';


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
//Prediksi
app.use(PredictRoute);
//Laporan kas
app.use(KasRoute);

/* Membuat tabel di database */
app.get('/api/create_table', (req, res) => {
    sequelize.sync();
    res.end("Tabel berhasil dibuat");
})

app.listen(port, () => {
    console.log(`Server running at ${hostname}:${port}`);
})