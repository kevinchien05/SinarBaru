import express from "express";
import Supplier from "../models/supplier.js";
import { sequelize } from "../models/model.js";
import { Op } from "sequelize";

const router = express.Router();

router.get('/supplier', async (req, res) => {
    try {
        let supplierCount = await Supplier.count();
        const { sort = 'Id', order = 'ASC', search = '' } = req.query;

        const searchCondition = search ? {
            [Op.or]: [
                {Id: {[Op.like]: `%${search}%`}},
                {SupplierName: {[Op.like]: `%${search}%`}},
                {PhoneNumber: {[Op.like]: `%${search}%`}},
                {Address: {[Op.like]: `%${search}%`}}
            ]

        } : {};

        Supplier.findAll(
            {
                where: searchCondition,
                order: [[sort, order]]
            }
        ).then((results) => {
            res.render("data_supplier", { i_user: req.session.user || "", suppliers: results, counter: supplierCount, sort, order, search });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.get('/api/supplier/:id', (req, res) => {
    Supplier.findOne({
        where: { Id: req.params.id }
    }).then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.get('/api/supplier2/:nama/:no/:alamat', async (req, res) => {
    const nama = req.params.nama;
    const no = req.params.no;
    const alamat = req.params.alamat;

    try {
        const results = await sequelize.query(
            `
            SELECT COUNT(*) AS total
            FROM supplier
            WHERE LOWER(SupplierName) = LOWER(:nama) 
            AND PhoneNumber = :no
            AND LOWER(Address) = LOWER(:alamat) 
            `,
            {
                replacements: { nama, no, alamat },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({ status: 200, error: null, Response: results });
    } catch (err) {
        res.json({ status: 502, error: err });
    }

});


router.get('/api/supplier', (req, res) => {
    Supplier.findAll().then((results) => {
        res.json({ status: 200, error: null, response: results });
    });
});

router.post('/api/supplier', (req, res) => {
    Supplier.create({ Id: req.body.Id, SupplierName: req.body.SupplierName, PhoneNumber: req.body.PhoneNumber, Address: req.body.Address, Description: req.body.Description }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.put('/api/supplier/:id', (req, res) => {
    Supplier.update({ SupplierName: req.body.SupplierName, PhoneNumber: req.body.PhoneNumber, Address: req.body.Address, Description: req.body.Description },
        { where: { Id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.delete('/api/supplier/:id', (req, res) => {
    Supplier.destroy({ where: { id: req.params.id } }
    ).then(() => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

export default router;