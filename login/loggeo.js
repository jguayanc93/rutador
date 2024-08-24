require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js')
const jws = require('jws');
const base64url = require('base64url');
/////llamada de funciones especificas segun su path
let {login} = require('../funciones/login/check_log.js')
let {clean_cookie} = require('../funciones/jwt/destructor.js')
let {mostrar} = require('../funciones/jwt/reveal.js')
let {decodificador} = require('../funciones/jwt/decodificador.js')

// let login = (req,res,next)=>{
//     if(objevacio(req.body)) res.send("body objeto vacio");
//     else{
//         let {userclient,passclient} = req.body;
//         conexion = new Connection(config);
//         conexion.connect();
//         conexion.on('connect',()=>{
//             if(err) console.log("ERROR: ",err);
//             sentencia(res,userclient,passclient);
//         })
//     }
// }
// let sentencia = (res,usu,pass)=>{
//     let sq_sql="jc_user_identificador";
//     let consulta = new Request(sq_sql,(err,rowCount,rows)=>{
//         if(err){
//             console.log(err);
//             res.status(401).send("error interno");
//         }
//         else{
//             conexion.close();
//             if(rows.length==0) res.status(400).send("sin resultados?");
//             else{
//                 let respuesta=[];
//                 let respuesta2={};
//                 let docheader=[];
//                 let contador=0;
//                 rows.forEach(fila => {
//                     let tmp={};
//                     fila.map(data=>{
//                         if(contador>=fila.length) contador=0;
//                         typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value;
//                         contador++;
//                     });
//                     respuesta.push(tmp);
//                 });
//                 Object.assign(respuesta2,respuesta);
//                 respuesta2.permisos=tkgenerator(respuesta2);
//                 let cadenitajson=JSON.stringify(respuesta2);
//                 res.cookie('cdk',respuesta2.permisos,{
//                     domain:'compudiskett.com.pe',
//                     path:'/',
//                     httpOnly:true,
//                     secure:true,
//                     sameSite:'None',
//                     signed:true
//                 })
//                 res.status(200).json(cadenitajson);
//             }
//         }
//     })
//     consulta.addParameter('usercuenta',TYPES.VarChar,usu);
//     consulta.addParameter('passcuenta',TYPES.VarChar,pass);
// }

router.use(express.json());

router.post('/',login)

router.post('/chekear',mostrar)////deberia solo mostrar el cookie externo mas nada

router.post('/mostrar',decodificador)///debera poder decodificar luego la estructura del permiso

router.post('/clean',clean_cookie)

module.exports=router;