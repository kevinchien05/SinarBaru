import express, { response } from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
//session
import session from 'express-session';

//controllers
import { sequelize } from "./models/model.js";
import permit from "./controllers/auth.js";

//Router
import RootRouter from './routes/Root.js';
import KasRoute from './routes/KasRoute.js';
import DebtRoute from './routes/DebtRoute.js';
import OperationalRoute from './routes/OperationalRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import PurchaseRoute from './routes/PurchaseRoute.js';
import SaleRoute from './routes/SaleRoute.js';
import ReturRoute from './routes/ReturRoute.js';
import SupplierRoute from './routes/SupplierRoute.js';
import FundRoute from './routes/FundRoute.js';
import PredictRoute from './routes/PredictRoute.js';


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
}));

//Login
app.use('/', RootRouter);
//Debt
app.use(permit(1, 2, 3), DebtRoute);
//Operational
app.use(permit(1, 2, 3), OperationalRoute);
//Fund
app.use(permit(1, 2, 3), FundRoute);
//Product
app.use(permit(1, 2), ProductRoute);
//Purchases
app.use(permit(1, 2), PurchaseRoute);
//Sales
app.use(permit(1, 2), SaleRoute);
//Retur
app.use(permit(1, 2), ReturRoute);
//Supllier
app.use(permit(1), SupplierRoute);
//Prediksi
app.use(permit(1), PredictRoute);
//Laporan kas
app.use(permit(1), KasRoute);



/* Membuat tabel di database */
app.get('/api/create_table', (req, res) => {
    sequelize.sync();
    res.end("Tabel berhasil dibuat");
})

app.listen(port, () => {
    console.log(`Server running at ${hostname}:${port}`);
})