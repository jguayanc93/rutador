require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let promocion = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {promo} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,promo) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,promo)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,promo); }
    });
}

let bd_consulta = (res,promo)=>{
    // let caracter="'"+"%"+sugerencia+"%"+"'";///no usar porqe sobre escribe las comillas simples
    let sp_sql="select b.codi,a.nomprom,b.monto,b.dsct,a.tipdsct,a.tipdsctoto,a.tipagrupa from mst_promocion a join dtl_promocion_progra b on b.idprom=a.idprom where YEAR(a.fecini)=YEAR(GETDATE()) AND MONTH(GETDATE()) BETWEEN MONTH(a.fecini) AND MONTH(a.fecfin) AND a.idprom=@promo";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            if(rows.length==0) res.status(401).send("sin resultados?");
            // if(rows.length==0) res.status(401).json({});
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
                console.log(respuesta2)
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('promo',TYPES.VarChar,promo);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={promocion}