require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');
const {consultas_almacenadas} = require('./indentificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let chekear = (req,res,next) => {
    // TE FALTA EL DOCUMENTO PARA SABER A QUIEN ACTUALIAR 
    console.log(req.body)
    // res.status(401).send("check terminal")
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    typeof vendedor_data=='string' ? saber_identificar(res,req.body) : res.status(401).send(vendedor_data);
}

let saber_identificar=(res,obje)=>{
    let encontrado=Object.keys(consultas_almacenadas).findIndex((match)=>match==Object.keys(obje)[0])
    // let remplazo=Object.keys(obje)[0];////no te olvide de pasar el valor a actualisar
    let remplazo=obje[Object.keys(obje)[0]];
    // encontrado!=-1 ? res.status(401).send(consultas_almacenadas[Object.keys(obje)[0]]+" "+obje.doc) : res.status(401).send("no match");
    encontrado!=-1 ? bd_conexion(res,consultas_almacenadas[Object.keys(obje)[0]],remplazo,obje.doc) : res.status(401).send("no match");
    // console.log(consultas_almacenadas[Object.keys(obje)[0]]);
}

let bd_conexion=(res,consulta,remplazo,doc)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,consulta,remplazo,doc); }
    });
}

let bd_consulta = (res,sp,remplazo,doc)=>{
    let sp_sql=sp;
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            res.status(401).send("actualisado");
        }
    })
    consulta.addParameter('update',TYPES.VarChar,remplazo);
    consulta.addParameter('doc',TYPES.VarChar,doc);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={chekear}