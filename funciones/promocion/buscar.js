require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let bprom = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {ncoti,nprom} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    // typeof vendedor_data=='string' ? bd_conexion(res,nprom,next) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,ncoti,nprom,next) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,ncoti,nprom,next)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,ncoti,nprom,next); }
    });
}

let bd_consulta = (res,ncoti,nprom,next)=>{
    let sp_sql="select idprom,nomprom,desprom,porvta,tipdsct,tipdsctoto,metrica from mst_promocion where estado=1 and idprom=@nprom";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            // conexion.close();
            if(rows.length==0) res.status(401).send("no promo");
            // else{ next() }
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
                // console.log(respuesta2);
                prom_repetida(res,ncoti,nprom,respuesta2[0],next)
            }
        }
    })
    consulta.addParameter('nprom',TYPES.VarChar,nprom);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

let prom_repetida=(res,ncoti,nprom,dataprom,next)=>{
    let nomprom="%"+dataprom[1]+"%";
    let idprom="%"+"#"+dataprom[0]+"%";
    // let sp_sql="select ndocu,descr from dtl01cot where ndocu=@ndoc and descr like @buscador";
    let sp_sql="select ndocu,descr from dtl01cot where ndocu=@ndoc and (descr like @nomprom OR descr like @idprom)";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            // if(rows.length==0) next();
            // else{ res.status(200).send("promo ya aplicada") }
            rows.length==0 ? next() : res.status(200).send("promo ya aplicada")
        }
    })
    consulta.addParameter('ndoc',TYPES.VarChar,ncoti);
    consulta.addParameter('nomprom',TYPES.VarChar,nomprom);
    consulta.addParameter('idprom',TYPES.VarChar,idprom);
    conexion.execSql(consulta);
}

module.exports={bprom}