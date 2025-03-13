
let mostrar= (req,res)=>{
    let cifrado=req.signedCookies;
    res.status(200).json(cifrado);
}

require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
// const jws = require('jws');
let {objevacio} = require('../objvacio/reqbody');

// let login =(req,res,next)=> objevacio(req.body) ? res.send("body objeto vacio") : logeo_conexion(res,req.body.userclient,req.body.passclient);
let login =(req,res,next)=> objevacio(req.body) ? res.send("body objeto vacio") : extraer_data(res,req.body);


let formulario_insertar = (res) => {
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ comprobacion_logeo(res); }
    });
}

let comprobacion_logeo = (res)=>{
    // let sq_sql="jc_user_identificador";
    let sq_sql="insert into tbl01_api_mensajes_temporales(mensaje,contexto,cliente_offset) values('prueba','externa','nada')";
    let consulta= new Request(sq_sql,(err,rowCount,rows)=>{
        if(err){
            console.log(err);
            res.status(401).send("error interno");
        }
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
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2.permisos);
                res.status(200).json(cadenitajson);
            }
        }
    })
    conexion.execSql(consulta);
}

// module.exports={login}

module.exports={mostrar,formulario_insertar}