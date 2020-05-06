import express from 'express';
import mysql from "../database";
import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();
const router = express.Router();

router.post(`/sendFeedback`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.userId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const userId = req.query.userId;
    const { feedback } = req.body;
    let sqlStr = `insert into feedback (userId, feedback) values (${userId}, "${feedback}")`
    mysql.execute(sqlStr).then(data => {
        res.json({code: 0, msg: "提交成功,感谢您的反馈"});
    }).catch(error => {
        res.json({ode: -1, msg: "提交失败", data: error});
    })
})

module.exports = router;