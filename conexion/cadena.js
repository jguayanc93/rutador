const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = {
    server:'192.168.1.101',
    authentication:{
        type:'default',
        options:{
            userName:process.env.BDUSER,
            password:process.env.BDPASS
        }
    },
    options:{
        encrypt:false,
        database:process.env.BDNAME,
        rowCollectionOnRequestCompletion:true,
        trustServerCertificate:true,
        requestTimeout:0
    }
}

module.exports={config,Connection,Request,TYPES}