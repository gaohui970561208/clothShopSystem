import express from 'express';   //使用express框架
import usersRouter from "./users";
import shopRouter from "./shop";
import productRouter from "./product";
import orderRouter from "./orders";
import feedbackRouter from "./feedback";

const router = express.Router();
const app = express();
router.use('/users', usersRouter);
router.use('/shop', shopRouter);
router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/feedback', feedbackRouter);

module.exports = router;