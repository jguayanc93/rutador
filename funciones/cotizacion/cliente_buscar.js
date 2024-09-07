require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let bcliente = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {sugerencia} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,sugerencia) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,sugerencia)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,sugerencia); }
    });
}

let bd_consulta = (res,sugerencia)=>{
    // let caracter="'"+"%"+sugerencia+"%"+"'";///no usar porqe sobre escribe las comillas simples
    let caracter="%"+sugerencia+"%";
    // let sp_sql="select IDdespacho,despacho from tbl_tipo_despacho where estado=1 and despacho LIKE @pista ";
    let sp_sql="select top 9 codcli,nomcli from mst01cli where estado=1 and nomcli like @pista";
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
                console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('pista',TYPES.VarChar,caracter);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={bcliente}