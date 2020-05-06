import express from 'express';
import mysql from "../database";
import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();
const router = express.Router();

//添加店铺
router.post(`/addShop`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.userId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    //判断当前用户下有几个店铺，若为5个，则取消创建;
    const userId = req.query.userId;
    mysql.getResult(`select count(*) from shops where userId=${userId}`).then(data => {
        if(parseInt(data) >= 5) {
            res.json({code: 2, msg: "店铺数量已满"});
        }
        else {
            // const shopData = {
        //     shopName:"我的店铺",
        //     shopLogo: "nologo",
        //     classifyList: ["1"].join("/"),
        //     shopBrief: "没有简介"
        // }
        const shopData = {
            shopName: req.body.shopName,
            shopLogo: req.body.shopLogo,
            shopBrief: req.body.shopBrief
        }
        mysql.execute(`insert into shops (userId,shopName,shopLogo,shopBrief) values ("${userId}","${shopData.shopName}","${shopData.shopLogo}","${shopData.shopBrief}")`).then(data => {
            res.json({code: 0, msg: "创建成功"});
        }).catch(error => {
            res.json({code: -1, msg: "创建失败", data:error});
        })
        }
    }).catch(error => {
        res.json({code: -1, msg:"服务器繁忙", data: error});
    })
})

//修改店铺信息
router.post(`/updateShop`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.shopId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const shopId = req.query.shopId;
    const shopData = {
        shopName: req.body.shopName,
        shopLogo: req.body.shopLogo,
        shopBrief: req.body.shopBrief
    }
    mysql.execute(`update shops set shopName="${shopData.shopName}",shopLogo="${shopData.shopLogo}",shopBrief="${shopData.shopBrief}" where shopId=${shopId}`).then(data => {
        res.json({code: 0, msg: "修改成功"});
    }).catch(error => {
        res.json({code: -1, msg: "修改失败", data:error});
    })
})

//删除店铺
router.delete(`/deleteShop`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.shopId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const shopId = req.query.shopId;
    mysql.execute(`delete from shops where shopId=${shopId}`).then(data => {
        res.json({code:0, msg: "删除成功"});
    }).catch(error => {
        res.json({code:-1, msg: "删除失败", data:error});
    })
})

//获取店铺信息列表
router.get(`/list`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.userId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const userId = req.query.userId;
    mysql.getObjList(`select *  from shops where userId=${userId}`).then(shopList => {
        res.json({code: 0, msg: "获取成功", data: shopList});
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
})

//获取店铺详情
router.get('/getShopInfo', jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.shopId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const shopId = req.query.shopId;
    mysql.getObj(`select * from shops where shopId=${shopId}`).then(data => {
        const reData = JSON.parse(JSON.stringify(data));
        res.json({code: 0, msg: '获取成功', data: reData});
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
})

module.exports = router;