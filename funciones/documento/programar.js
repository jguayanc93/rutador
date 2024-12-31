require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');
// const {hora,minutos} = require('./horarios');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let programar_factura = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {factura,fecha,hora,minuto} = req.body;
    console.log(req.body)
    let vendedor_data='cadena';
    // // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,factura,fecha,hora,minuto) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,factura,fecha,hora,minuto)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,factura,fecha,hora,minuto); }
    });
}

let bd_consulta = (res,factura_data,fecha,hora,minuto)=>{
    // let sp_sql="insert into tbl01_api_programar values(@fecha,@documento,@hora,@estado,@cliente,@despacho,@ejecutivo,@minutos,@reprogramado,@piking,@cheking,@agencia,@destino)";
    let sp_sql="insert into tbl01_api_programar values(@fecha,@documento,@hora,@estado,@cliente,@despacho,@ejecutivo,@minutos,@reprogramado,@piking,@cheking,@agencia,@destino,@almacen,@nom_ejecutivo,@cod_cli,@codtra,@nomtra,@nomdep,@nompro)";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            if(rows.length==0) res.status(200).json({"estado":"creado"});
            else{
                conexion.close();
                if(rows.length==0) res.status(200).json({"estado":"factura programada"});
            }
        }
    })
    consulta.addParameter('fecha',TYPES.VarChar,fecha);
    consulta.addParameter('documento',TYPES.VarChar,factura_data[2]);
    consulta.addParameter('hora',TYPES.VarChar,hora);
    consulta.addParameter('estado',TYPES.VarChar,'0');
    consulta.addParameter('cliente',TYPES.VarChar,factura_data[4]);
    consulta.addParameter('despacho',TYPES.Int,factura_data[0]);
    consulta.addParameter('ejecutivo',TYPES.VarChar,factura_data[7]);
    consulta.addParameter('minutos',TYPES.VarChar,minuto);
    consulta.addParameter('reprogramado',TYPES.VarChar,'N');
    consulta.addParameter('piking',TYPES.Int,0);
    consulta.addParameter('cheking',TYPES.Int,0);
    consulta.addParameter('agencia',TYPES.VarChar,'ventanilla');
    consulta.addParameter('destino',TYPES.VarChar,factura_data[9]);
    consulta.addParameter('almacen',TYPES.VarChar,factura_data[6]);
    consulta.addParameter('nom_ejecutivo',TYPES.VarChar,factura_data[8]);
    consulta.addParameter('cod_cli',TYPES.VarChar,factura_data[3]);
    consulta.addParameter('codtra',TYPES.VarChar,'');
    consulta.addParameter('nomtra',TYPES.VarChar,'');
    consulta.addParameter('nomdep',TYPES.VarChar,'');
    consulta.addParameter('nompro',TYPES.VarChar,'');
    conexion.execSql(consulta);
}

module.exports={programar_factura}