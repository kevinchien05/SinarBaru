import express from "express";
import Operational from "../models/operational.js";
import User from "../models/user.js";
import { sequelize } from "../models/model.js";
import { Op, or } from "sequelize";

const router = express.Router();

router.get('/operational', async (req, res) => {
    try {
        const { sort = 'Date', order = 'ASC', search = '' } = req.query;

        const searchCondition = search ? {
            [Op.or]: [
                { Date: { [Op.like]: `%${search}%` } },
                { Total: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } },
            ]
        } : {};

        Operational.findAll({
            where: searchCondition,
            order: [[sort,order]],
            include: [{ model: User }]
        }).then((results) => {
            res.render("biaya_operasional", { i_user: req.session.user || "", operationals: results, sort, order, search });
        });
    } catch (error) {
        res.status(500).send("Terjadi Error");
    }

});

router.post('/api/operational', (req, res) => {
    Operational.create({ Date: req.body.Date, Description: req.body.Description, Total: req.body.Total, UserID: req.body.UserID }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.put('/api/operational/:id', (req, res) => {
    Operational.update({ Date: req.body.Date, Description: req.body.Description, Total: req.body.Total },
        { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
});

router.delete('/api/operational/:id', (req, res) => {
    Operational.destroy({ where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
});

export default router;