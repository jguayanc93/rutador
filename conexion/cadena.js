const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = {
    server:'192.168.1.101',
    authentication:{
        type:'default',
        options:{
            userName:'sa',
            password:'Nava2008'
        }
    },
    options:{
        encrypt:false,
        database:'bdnava01',
        rowCollectionOnRequestCompletion:true,
        trustServerCertificate:true
    }
}

module.exports={config,Connection,Request,TYPES}