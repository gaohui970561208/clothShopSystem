import createError from 'http-errors'; //处理错误
import express from 'express';   //使用express框架
import cors from 'cors';    //解决跨域插件
import path from 'path';     //路径
import cookieParser from 'cookie-parser';        //这就是一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
import bodyParser from 'body-parser';       //使用body处理数据请求,用于处理JSON, Raw, Text和URL编码的数据。
import multer from 'multer';        //用于处理enctype="multipart/form-data"（设置表单的MIME编码）的表单数据。
import logger from 'morgan';     //日志

import indexRouter from './routes/index';    //index路由
import apiRouter from './routes/api';   //api路由

const app = express();
//跨域解决插件
app.use(cors());
//声明使用中间件
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true}));
app.use(bodyParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
// app.use(multer());
app.use(express.static(path.join(__dirname, '../public')));

//解决请求跨域
// app.all('/*',function (req, res, next) { // （自行添加）
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
//     if (req.method == 'OPTIONS') {
//         res.sendStatus(200);
//     }
//     else {
//         next();
//     }
// });

app.all('*', (req, res, next) => {
    //全局拦截内容
    next();
})
//声明路由
app.use('/', indexRouter);
app.use('/api', apiRouter);

//自定义404中间件
app.use(function(req, res, next) {
    next(createError(404));
});

//自定义错误抛出中间件
app.use(function(err, req, res, next) { 
    // 本地设置，仅抛出开发错误
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // 渲染错误页面
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
