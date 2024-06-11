import express from "express";
import Fund from "../models/fund.js";
import User from "../models/user.js";
import { sequelize } from "../models/model.js";
import { Op, or } from "sequelize";

const router = express.Router();

router.get('/fund', (req, res) => {
    try {
        const { sort = 'Date', order = 'ASC', search = '' } = req.query;

        const searchCondition = search ? {
            [Op.or]: [
                { Date: { [Op.like]: `%${search}%` } },
                { Total: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } },
            ]
        } : {};

        Fund.findAll({
            where: searchCondition,
            order: [[sort,order]],
            include: [{ model: User }]
        }).then((results) => {
            res.render("dana_toko", { i_user: req.session.user || "", funds: results, sort, order, search });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }
});

router.post('/api/fund', (req, res) => {
    Fund.create({ Date: req.body.Date, Description: req.body.Description, Total: req.body.Total, UserID: req.body.UserID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.delete('/api/fund/:id', (req, res) => {
    Fund.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

export default router;