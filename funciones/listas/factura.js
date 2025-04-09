require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');
/////////////////RECORDATORIO PARA MODIFICAR Y MOSTRAR LA LISTA DE COTIZACIONES SEGUN PETICION TODO
let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let chekeador=(req,res,next)=>{
    let safe_coki=req.signedCookies;
    objevacio(safe_coki) ? res.status(401).send("logeate") : next();
}

let blistafactus = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    // let {dia} = req.body;
    let vendedor_data = "V0266";
    // let vendedor_data = decodificador(valid_coki);
    // typeof vendedor_data=='object' ? bd_conexion(res,vendedor_data) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,vendedor_data) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,vendedor)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,vendedor); }
    });
}

let bd_consulta = (res,vendedor)=>{
    let sp_sql="select  CONVERT(varchar,fecha,111),ndocu,nomcli,totn,(case TipEnt when 1 then 'ventanilla' when 3 then 'Lima' when 4 then 'Provincia' end)as 'entrega',(case cdge when '' then 'FACTURA' when '09' then 'GUIA' when '51' then 'N.DESPACHO' end)as 'estado' from mst01fac where flag<>'*' and YEAR(fecha)=2025 and MONTH(fecha)=CONVERT(varchar(2),GETDATE(),101) and DAY(fecha)=CONVERT(varchar(2),GETDATE(),103) AND cdocu in('01','03') and codven_usu=@vendedor";
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
                Object.assign(respuesta2,respuesta);
                console.log(respuesta2);
                let cadenitajson=JSON.stringify(respuesta2)
                res.status(200).json(cadenitajson);
                // prom_repetida(res,ncoti,nprom,respuesta2[0],next)
            }
        }
    })
    consulta.addParameter('vendedor',TYPES.VarChar,vendedor);
    conexion.execSql(consulta);
}


let blistafactusxdia = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {dia} = req.body;
    let dia_exacto=dia.substring(8);    
    let vendedor_data = "V0266";
    // console.log(typeof dia_exacto);
    console.log(dia_exacto);
    // let vendedor_data = decodificador(valid_coki);
    // typeof vendedor_data=='object' ? bd_conexion(res,vendedor_data) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion2(res,vendedor_data,dia_exacto) : res.status(401).send(vendedor_data);
}

let bd_conexion2=(res,vendedor,dia)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta3(res,vendedor,dia); }
    });
}

let bd_consulta3 = (res,vendedor,dia)=>{
    let sp_sql="select  CONVERT(varchar,fecha,111),ndocu,nomcli,totn,(case TipEnt when 1 then 'ventanilla' when 3 then 'Lima' when 4 then 'Provincia' end)as 'entrega',(case cdge when '' then 'FACTURA' when '09' then 'GUIA' when '51' then 'N.DESPACHO' end)as 'estado' from mst01fac where flag<>'*' and YEAR(fecha)=2025 and MONTH(fecha)=CONVERT(varchar(2),GETDATE(),101) and DAY(fecha)=@dia AND cdocu in('01','03') and codven_usu=@vendedor";
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
                Object.assign(respuesta2,respuesta);
                console.log(respuesta2);
                let cadenitajson=JSON.stringify(respuesta2)
                res.status(200).json(cadenitajson);
                // prom_repetida(res,ncoti,nprom,respuesta2[0],next)
            }
        }
    })
    consulta.addParameter('dia',TYPES.VarChar,dia);
    consulta.addParameter('vendedor',TYPES.VarChar,vendedor);
    conexion.execSql(consulta);
}

module.exports={chekeador,blistafactus,blistafactusxdia}