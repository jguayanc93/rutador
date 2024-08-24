require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {decodificador} = require('../jwt/decodificador')
const {objevacio} = require('../objvacio/reqbody')

let chekeador = (req,res,next) => {
    let safe_coki = req.signedCookie;
    // let proto_coki = req.body;
    objevacio(safe_coki) ? res.status(401).send("logeate") : next();
    // objevacio(proto_coki) ? res.status(401).send("logeate") : next();
}

let ven_cuota = (req,res,next) => {
    let valid_coki = req.signedCookie;
    let vendedor_data = decodificador(valid_coki);
    // let mes = req.body.mes;
    // let codven='V0172';
    typeof vendedor_data=='object' ? bd_conexion(res,mes,vendedor_data.payload.vendedor) : res.status(401).send(vendedor_data);
    // typeof codven=='string' ? bd_conexion(res,mes,codven) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,mes,codven)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,mes,codven); }
    });
}

let bd_consulta = (res,mes,codven) =>{
    let sp_sql=process.env.VENDEDOR_CUOTA;
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
                        typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value.toFixed(2);
                        contador++;
                    })
                    respuesta.push(tmp);
                });
                console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                console.log(respuesta2);
                ////CREAR UNA NUEVA SALIDA PARA DESPLEGAR LOS MONTOS
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('mes',TYPES.Int,mes);
    consulta.addParameter('vendedor',TYPES.VarChar,codven);
    conexion.callProcedure(consulta);
}

module.exports={chekeador,ven_cuota}