require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const os = require('node:os')
// const net = require('node:net').SocketAddress
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');
// const { SocketAddress,Socket,Server } = require('node:net');
// const http = require('http')

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let doc_factura = (req,res,next) => {
    let host=req.hostname;
    let user_ip=req.ip;
    let valid_coki = req.signedCookies;
    let {opc1} = req.body;
    // res.status(200).json({supos_ip:user_ip,hst:host})
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,opc1) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,opc1)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,opc1); }
    });
}

let bd_consulta = (res,opc1) =>{
    // let sp_sql=process.env.VENDEDOR_CUOTA;
    let sp_sql="select TipEnt,codtra,Consig,dirent,codven,observ,orde from mst01fac where cdocu in ('01','03') and ndocu= @doc";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            if(rows.length==0) res.status(401).send("sin resultados?");
            else{
                let respuesta=[];
                let respuesta2={};
                let contador=0;
                rows.forEach(fila=>{
                    let tmp={};
                    fila.map(data=>{
                        if(contador>=fila.length) contador=0;
                        typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value;
                        contador++;
                    })
                    respuesta.push(tmp);
                });
                // console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                console.log(respuesta2[0]);
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('doc',TYPES.VarChar,opc1);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={observador,doc_factura}