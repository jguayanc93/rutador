require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
// const jws = require('jws');
let {objevacio} = require('../objvacio/reqbody');
let {jwtgenerator} = require('../jwt/generador');

let login = (req,res,next) => objevacio(req.body) ? res.send("body objeto vacio") : logeo_conexion(res,req.body.userclient,req.body.passclient);

let logeo_conexion = (res,userclient,passclient) => {    
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ comprobacion_logeo(res,userclient,passclient); }
    });
}

let comprobacion_logeo = (res,usu,pass)=>{
    // let sq_sql="jc_user_identificador";
    let sq_sql=process.env.LOGIN_IDENTIFICADOR;
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
                respuesta2.permisos=jwtgenerator(respuesta2);
                let cadenitajson=JSON.stringify(respuesta2.permisos);
                // res.cookie('cdk',respuesta2.permisos,{
                //     domain:'compudiskett.com.pe',
                //     path:'/',
                //     httpOnly:true,
                //     secure:true,
                //     sameSite:'None',
                //     signed:true
                // })
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('usercuenta',TYPES.VarChar,usu);
    consulta.addParameter('passcuenta',TYPES.VarChar,pass);
    conexion.callProcedure(consulta);
}

module.exports={login}