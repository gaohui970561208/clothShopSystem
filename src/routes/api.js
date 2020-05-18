import express from 'express';   //使用express框架
import usersRouter from "./users";
import shopRouter from "./shop";
import productRouter from "./product";
import orderRouter from "./orders";
import feedbackRouter from "./feedback";

//这里的api是路径总成，代表着前端请求的地址中需要添加api这个字段，比如服务后端的地址为http://127.0.0.1:3000; 此时请求的地址需要是http://127.0.0.1:3000/api
const router = express.Router();
const app = express();
//类型封装，下面不同的路径对应不同的作用的接口
router.use('/users', usersRouter);
router.use('/shop', shopRouter);
router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/feedback', feedbackRouter);

//接口添加后需要抛出，否则app.js接受不到所需要的路径信息
module.exports = router;