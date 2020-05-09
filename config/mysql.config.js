import mysql from 'mysql';

const mysql_config = { // mysql采用pool连接池基础配置 （采用pool连接池与不采用配置略有不同，具体请查看文档）
    connectionLimit : 50, // 最大连接数
    host : '127.0.0.1', // 本地搭建则本机ip,远程服务器则远程服务器ip
    port : 3306,  //连接数据库的端口号
    user : 'root', // mysql 账户
    password : 'gaohui1995', // mysql 密码
    database : 'clothShop', // 要操作的数据库
    supportBigNumbers: true, //数据库支持bigint或decimal类型列时，需要设此option为true （默认：false）
    connectTimeOut: 5000,   //连接超时
}

const pool = mysql.createPool(mysql_config); //创建连接池

//将结果以对象数组返回
const getObjList =( sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return; 
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    });
};
//返回一个对象
const getObj=( sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return; 
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve( res[0] || null );
            });
        });
    });
};

//返回单个查询结果
const getResult=(sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return; 
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject( error );
                    return;
                }
                for( let i in res[0] )
                {
                    resolve( res[0][i] || null );
                    return;
                }
                resolve(null);
            });
        });
    });
}

//执行代码，返回执行结果
const execute=(sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return; 
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve( res );
            });
        });
    });
}

module.exports = pool;