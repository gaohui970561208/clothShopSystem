import express from 'express';
import mysql from "../database";
import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();
const router = express.Router();

// router.get(`/`, jsonParser, async (req,res,next) => {
//     res.json({code: 0, msg: "获取成功"});
// })


//添加商品
router.post(`/addProduct`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.shopId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const shopId = req.query.shopId;
    const productData = {
        productName: req.body.productName,
        productImg: req.body.productImg,
        productDescript: req.body.productDescript,
        productDesList: req.body.productDesList.join(" && "),
        classifyId: req.body.classifyId,
        defaultCategoryId: req.body.defaultCategoryId,
        status: req.body.status,
        categoryList: req.body.categoryList
    };
    //对数据进行处理，首先进行商品添加
    const { productName, productImg, productDescript, productDesList, classifyId, status, categoryList, defaultCategoryId} = productData;
    let sqlStr = `insert into products (productName,productImg,productDescript,productDesList,classifyId,shopId,status,defaultCategoryId) values ("${productName}","${productImg}","${productDescript}","${productDesList}",${classifyId},${shopId},${status},${defaultCategoryId})`;
    mysql.execute(sqlStr).then(data => {
        const resData = JSON.parse(JSON.stringify(data));
        //添加成功后将关联规格的productId连接到新创建的商品中
        let categorySql = `update category set productId=${resData.insertId} where `;
        categoryList.forEach((element,index) => {
            categorySql += `categoryId=${element.categoryId} `;
            if(index < categoryList.length - 1) {
                categorySql += `or `;
            }
            if(index === categoryList.length - 1) {
                categorySql += `;`;
            }
            console.log(categorySql);
        });
        mysql.execute(categorySql).then(resCateData => {
            const resCate = JSON.parse(JSON.stringify(resCateData));
            res.json({code: 0, msg: "添加成功", data: resCate});
        }).catch(error => {
            res.json({code: -1, msg: "添加失败", data: error});
        })
    }).catch(error => {
        res.json({code: -1, msg: "服务器繁忙", data: error});
    })
});

//获取商品列表，后台
router.get(`/listBack`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.shopId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const shopId = req.query.shopId;
    mysql.getObjList(`select * from products,category where products.productId=category.productId and products.defaultCategoryId = category.categoryId and products.shopId="${shopId}" and products.isDelete=0`).then(data => {
        let resData = JSON.parse(JSON.stringify(data));
        //对返回的数据进行处理，当productId一致时，将规格数据转为对象数组存入相同数据中
        resData.forEach(element => {
            const cateData = {
                categoryId: element.categoryId,
                categoryName: element.categoryName,
                cateNum: element.cateNum,
                catePrice: element.catePrice,
                cateImgUrl: element.cateImgUrl
            };
            element.productDesList = element.productDesList.split("&&");
            element.categoryList = [];
            element.categoryList.push(cateData);
        })
        res.json({code: 0, msg: "获取成功", data: resData});
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
}),

//获取商品详情
router.get(`/productInfo`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.productId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    };
    const productId = req.query.productId;
    mysql.getObj(`select * from shops,products,category where shops.shopId=products.shopId and products.productId="${productId}" and products.isDelete=0 and products.defaultCategoryId=category.categoryId`).then(productData => {
        let resData = JSON.parse(JSON.stringify(productData));
        mysql.getObjList(`select * from category where productId="${productId}"`).then(cateData => {
            const data = JSON.parse(JSON.stringify(cateData));
            resData.categoryList=[];
            resData.categoryList.push(...data);
            resData.productDesList = resData.productDesList.split("&&");
            res.json({code: 0, msg: "获取成功", data: resData});
        }).catch(error => {
            res.json({code: -1, msg: "获取失败", data: error});
        })
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
})

//获取商品列表，移动端
router.get(`/list`, jsonParser, async (req,res,next) => {
    if(!req.query || Object.keys(req.query).length === 0) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    };
    const classifyId = req.query.classifyId;
    let sqlStr = `select * from products,category where products.productId=category.productId and products.defaultCategoryId = category.categoryId and products.isDelete=0 and products.status=1`;
    if(parseInt(classifyId)) {
        sqlStr += ` and products.classifyId=${classifyId}`;
    }
    sqlStr += ' order by products.hotNum desc';
    mysql.getObjList(sqlStr).then(data => {
        let resData = JSON.parse(JSON.stringify(data));
        //对返回的数据进行处理，当productId一致时，将规格数据转为对象数组存入相同数据中
        resData.forEach(element => {
            const cateData = {
                categoryId: element.categoryId,
                categoryName: element.categoryName,
                cateNum: element.cateNum,
                catePrice: element.catePrice,
                cateImgUrl: element.cateImgUrl
            };
            element.productDesList = element.productDesList.split("&&");
            element.categoryList = [];
            element.categoryList.push(cateData);
        })
        res.json({code: 0, msg: "获取成功", data: resData});
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
})
//添加购物车
router.post(`/addShopingCart`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.userId) {
        res.json({code: -1, msg: "服务器出错"});
        return;
    }
    const userId = req.query.userId;
    const { categoryId, productNum } = req.body;
    const productData = req.body;
    let resData = [];
    mysql.getResult(`select shoppingCart from users where userId="${userId}"`).then(cartData => {
        //在购物车没有东西的情况下，直接添加信息
        if(!cartData || JSON.parse(cartData).length === 0) {
            //将规格的id存入购物车中
            resData.push(productData);
            const resStr = JSON.stringify(resData);
            let sqlStr = `update users set shoppingCart='${resStr}' where userId=${userId}`;
            mysql.execute(sqlStr).then(reData => {
                res.json({code: 0, msg: "添加购物车成功", data: reData});
                return;
            }).catch(error => {
                res.json({code: -1, msg: "添加失败", data: error});
                return;
            })
        } else {
            const shoppingCartData = JSON.parse(cartData);
            //对比已有数据，有则不添加，没有则加入
            let isHave = false;
            shoppingCartData.forEach(element => {
                if(parseInt(element.categoryId) === parseInt(productData.categoryId)) {
                    isHave = true;
                    res.json({code: 1, msg: "已经在您的购物车里啦"});
                    return;
                }
            })
            if(!isHave) {
                resData = JSON.parse(cartData);
                resData.push(productData);
                console.log(resData);
                const resStr = JSON.stringify(resData);
                mysql.execute(`update users set shoppingCart='${resStr}' where userId=${userId}`).then(reData => {
                    res.json({code: 0, msg: "添加购物车成功", data: resStr});
                    return;
                }).catch(error => {
                    res.json({code: -1, msg: "添加失败", data: error});
                    return;
                })
            } else {
                return;
            }
        }
    }).catch(error => {
        res.json({code: -1, msg: "添加失败", data: error});
        return;
    })
})

//查询商品，关键字模糊查询
router.post(`/searchProducts`, jsonParser, async (req,res,next) => {
    let shopId = null;
    let title = null;
    if(req.query && Object.keys(req.query).length > 0 && req.query.shopId) {
        shopId = req.query.shopId;
    }
    if(req.body && Object.keys(req.body).length > 0 && req.body.title) {
        title = req.body.title;
    }
    let sqlStr = `select * from products,category where products.productId=category.productId and products.defaultCategoryId = category.categoryId and products.isDelete=0`;
    //若存在shopId,则说明需要在店铺内查询
    if(shopId) {
        sqlStr += ` and products.shopId=${shopId}`;
    } else {
        //若不存在，则说明是在移动端，此时非上架物品不显示
        sqlStr += ` and products.status=1`;
    }
    if(title) {
        sqlStr += ` and products.productName like "%${title}%"`;
    }
    mysql.getObjList(sqlStr).then(data => {
        let resData = JSON.parse(JSON.stringify(data));
        //对返回的数据进行处理，当productId一致时，将规格数据转为对象数组存入相同数据中
        resData.forEach(element => {
            element.productDesList = element.productDesList.split("&&");
        });
        res.json({code: 0, msg: "获取成功", data: resData});
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
}),

//修改商品信息
router.post(`/updateProduct`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.productId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const productId = req.query.productId;
    const body = {
        productName: req.body.productName,
        productImg: req.body.productImg,
        productDescript: req.body.productDescript,
        productDesList: req.body.productDesList.join(" && "),
        classifyId: req.body.classifyId,
        defaultCategoryId: req.body.defaultCategoryId
    };
    //对数据进行处理，首先进行商品添加
    const { productName, productImg, productDescript, productDesList, classifyId, defaultCategoryId} = body;
    let sqlStr = `update products set productName="${productName}",productImg="${productImg}",productDescript="${productDescript}",productDesList="${productDesList}",classifyId="${classifyId}",defaultCategoryId="${defaultCategoryId}" where productId=${productId}`;
    mysql.execute(sqlStr).then(data => {
        res.json({code: 0, msg: "修改成功", data: data});
    }).catch(error => {
        res.json({code: -1, msg: "修改失败", data: error});
    })
}),

//添加规格
router.post(`/addCategory`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.shopId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const shopId = req.query.shopId;
    let productId = 0;
    if(req.query.productId) {
        productId = req.query.productId;
    }
    const body = {
        categoryName: req.body.categoryName,
        cateNum: req.body.cateNum,
        catePrice: req.body.catePrice,
        cateImgUrl: req.body.cateImgUrl
    };
    let sqlStr = `insert into category (shopId,productId,categoryName,cateNum,catePrice,cateImgUrl) values (${shopId},${productId},"${body.categoryName}",${body.cateNum},${body.catePrice},"${body.cateImgUrl}")`;
    mysql.execute(sqlStr).then(data => {
        const resData = JSON.parse(JSON.stringify(data));
        res.json({code: 0, msg: "添加成功", data: resData});
    }).catch(error => {
        res.json({code: -1, msg: "添加失败", data: error});
    })
})

//修改规格
router.post(`/updateCategory`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.categoryId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const categoryId = req.query.categoryId;
    const body = {
        categoryName: req.body.categoryName,
        cateNum: req.body.cateNum,
        catePrice: req.body.catePrice,
        cateImgUrl: req.body.cateImgUrl
    };
    let sqlStr = `update category set categoryName="${body.categoryName}",cateNum=${body.cateNum},catePrice=${body.catePrice},cateImgUrl="${body.cateImgUrl}" where categoryId=${categoryId}`;
    mysql.execute(sqlStr).then(data => {
        const resData = JSON.parse(JSON.stringify(data));
        res.json({code: 0, msg: "修改成功", data: resData});
    }).catch(error => {
        res.json({code: -1, msg: "修改失败", data: error});
    })
})

//删除规格
router.delete(`/deleteCategory`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.categoryId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const categoryId = req.query.categoryId;
    let sqlStr = `delete from category where categoryId = ${categoryId}`;
    mysql.execute(sqlStr).then(data => {
        res.json({code: 0, msg: "删除成功"});
    }).catch(error => {
        res.json({code: -1, msg: "删除失败"});
    })
})

//上下架和删除商品
router.post(`/updateProductStatus`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.productId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const productId = req.query.productId;
    const type = req.body.type;
    if(parseInt(type) === 1) {
        const status = req.body.status;
        mysql.execute(`update products set status=${status} where productId=${productId}`).then(data => {
            res.json({code: 0, msg: "修改成功"});
        }).catch(error => {
            res.json({code: -1, msg: "修改失败", data: error});
        })
    } else if(parseInt(type) === 2) {
        mysql.execute(`update products set isDelete=1 where productId=${productId}`).then(data => {
            res.json({code: 0, msg: "删除成功"});
        }).catch(error => {
            res.json({code: -1, msg: "删除失败", data: error});
        })
    }
})

//添加分类
router.post(`/addClassify`, jsonParser, async (req, res, next) => {
    if(!req.body || Object.keys(req.body).length === 0 || !req.body.classifyName) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const { classifyName, classifyImg = null } = req.body;
    mysql.execute(`insert into classify (classifyName,classifyImg,isDelete) values ("${classifyName}","${classifyImg}",0)`).then(data => {
        res.json({code: 0, msg: "添加成功"});
    }).catch(error => {
        res.json({code: -1, msg: "添加失败", data: error});
    })
})

//删除分类
router.delete(`/deleteClassify`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.classifyId) {
        res.json({code: -1, msg: "服务器繁忙"});
    }
    const classifyId = req.query.classifyId;
    mysql.execute(`update classify set isDelete=1 where classifyId=${classifyId}`).then(data => {
        res.json({code: 0, msg: "删除成功"});
    }).catch(error => {
        res.json({code: -1, msg: "删除失败", data: error});
    })
})

//修改分类
router.post(`/updateClassify`, jsonParser, async (req, res, next) => {
    if(!req.query || Object.keys(req.query).length === 0 || !req.query.classifyId) {
        res.json({code: -1, msg: "服务器繁忙"});
        return;
    }
    const classifyId = req.query.classifyId;
    if(!req.body || Object.keys(req.body).length === 0 || !req.body.classifyName) {
        res.json({code: -1, msg: "请输入正确分类名称"});
        return;
    }
    const { classifyName, classifyImg } = req.body;
    let sqlStr = `update classify set classifyName="${classifyName}", classifyImg='${classifyImg}' where classifyId=${classifyId}`;
    mysql.execute(sqlStr).then(data => {
        res.json({code: 0, msg: "修改成功"});
    }).catch(error => {
        res.json({code: -1, msg: "修改失败", data: error});
    })
})

//获取分类列表
router.get(`/getClassifyList`, jsonParser, async (req, res, next) => {
    mysql.getObjList(`select * from classify where isDelete=0`).then(data => {
        res.json({code: 0, msg: '获取成功', data: data})
    }).catch(error => {
        res.json({code: -1, msg: "获取失败", data: error});
    })
})

module.exports = router;