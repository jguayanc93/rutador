require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();


let addprom = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {ncoti,fullpromo} = req.body;
    console.log("objeto de promocion especifica")
    console.log(req.body);
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,ncoti,fullpromo) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,ncoti,fullpromo)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{
            console.log("revisar si es descuento o bonificacion")
            // Object.keys(fullpromo).includes("descuento") ? cabesera_refresco(res,ncoti,fullpromo) : detallado_bucle(res,ncoti,fullpromo);
            Object.keys(fullpromo).includes("descuento") ? revisar_cabesa(res,ncoti,fullpromo) : detallado_bucle(res,ncoti,fullpromo);
            
        }
    });
}

let revisar_cabesa=(res,ncoti,fullpromo)=>{
    let sp_sql="select tota,toti,totn from mst01cot where ndocu=@ncoti";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){
            console.log("error interno")
            console.log(err);
        }
        else{
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
                // console.log(respuesta);
                // console.log("aqui mira");
                console.log(respuesta2[0])
                fullpromo["descuento"][1]=respuesta2[0][0]+fullpromo["descuento"][1];
                fullpromo["descuento"][2]=respuesta2[0][1]+fullpromo["descuento"][2];
                fullpromo["descuento"][3]=respuesta2[0][2]+fullpromo["descuento"][3];
                // console.log(fullpromo)
                cabesera_refresco(res,ncoti,fullpromo);
            }
        }
    })
    consulta.addParameter('ncoti',TYPES.VarChar,fullpromo["descuento"][0]);
    conexion.execSql(consulta);
}

let cabesera_refresco=(res,ncoti,fullpromo)=>{
    // let sp_sql="select ndocu,tota,toti,totn from mst01cot where ndocu=@ncoti";
    let sp_sql="update mst01cot set tota=@tota,toti=@toti,totn=@totn where ndocu=@ncoti and flag=0";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){
            console.log("error interno")
            console.log(err);
            // res.status(401).send("error interno");
        }
        else{
            if(rows.length==0){
                delete fullpromo["descuento"];
                detallado_bucle(res,ncoti,fullpromo);
                // res.status(401).send("sin resultados?");
            }
            else{
                // delete fullpromo["descuento"];
                // detallado_bucle(res,ncoti,fullpromo);
            }
        }
    })

    consulta.addParameter('tota',TYPES.VarChar,fullpromo["descuento"][1].toFixed(2));
    consulta.addParameter('toti',TYPES.VarChar,fullpromo["descuento"][2].toFixed(2));
    consulta.addParameter('totn',TYPES.VarChar,fullpromo["descuento"][3].toFixed(2));
    consulta.addParameter('ncoti',TYPES.VarChar,fullpromo["descuento"][0]);
    conexion.execSql(consulta);
}
//////////////BUCLE DE PROMOCIONES GUARDADAS
let detallado_bucle = (res,ncoti,fullpromo) => {
    let contador=0;
    // let orden=[];
    let orden=Object.keys(fullpromo);
    // for(let indice in fullpromo){orden.push(indice);}
    // minibucle(res,dataenviada,objtotal,totalisado,tcm,formato,orden.length,orden,contador);
    console.log(orden);
    // minibucle(res,ncoti,fullpromo,orden,contador);
    minibucle2(res,ncoti,fullpromo,orden,contador);
}
let minibucle2=(res,ncoti,fullpromo,longitud,contador)=>{
    if(longitud.length<=contador){
        // direccion(res,dataenviada,objtotal,totalisado,tcm,formato,contador)
        conexion.close();
        res.status(200).send("anidamiento exitoso")
    }
    else{
        // minibucle(res,ncoti,fullpromo,longitud,contador+1)
        let sp_sql="GrabaDTLCotFacWeb";
        let consulta2=new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            // else{ minibucle(res,dataenviada,objtotal,totalisado,tcm,formato,longitud,orden,contador+1); }
            else{ minibucle2(res,ncoti,fullpromo,longitud,contador+1); }
        })
        consulta2.addParameter('cdocu',TYPES.Char,fullpromo[longitud[contador]][1]);
        consulta2.addParameter('ndocu',TYPES.Char,fullpromo[longitud[contador]][2]);
        consulta2.addParameter('codcli',TYPES.Char,fullpromo[longitud[contador]][3]);
        consulta2.addParameter('tcam',TYPES.Float,fullpromo[longitud[contador]][4]);
        consulta2.addParameter('mone',TYPES.Char,fullpromo[longitud[contador]][8]);
        consulta2.addParameter('moneitm',TYPES.Char,fullpromo[longitud[contador]][9]);
        consulta2.addParameter('aigv',TYPES.Char,fullpromo[longitud[contador]][10]);///falta aigv
        consulta2.addParameter('item',TYPES.Float,fullpromo[longitud[contador]][6]);
        consulta2.addParameter('codi',TYPES.Char,fullpromo[longitud[contador]][11]);
        consulta2.addParameter('codf',TYPES.Char,fullpromo[longitud[contador]][12]);
        consulta2.addParameter('marc',TYPES.Char,fullpromo[longitud[contador]][13]);
        consulta2.addParameter('umed',TYPES.Char,fullpromo[longitud[contador]][14]);
        consulta2.addParameter('descr',TYPES.Char,fullpromo[longitud[contador]][15]);
        consulta2.addParameter('cant',TYPES.Float,fullpromo[longitud[contador]][7]);
        consulta2.addParameter('preu',TYPES.Float,fullpromo[longitud[contador]][16]);
        consulta2.addParameter('tota',TYPES.Float,fullpromo[longitud[contador]][17]);
        consulta2.addParameter('dsct',TYPES.Float,fullpromo[longitud[contador]][18]);
        consulta2.addParameter('totn',TYPES.Float,fullpromo[longitud[contador]][19]);
        consulta2.addParameter('AnulaDetalle',TYPES.Char,'');
        consulta2.addParameter('codalm',TYPES.Char,fullpromo[longitud[contador]][20]);
        consulta2.addParameter('cost',TYPES.Float,fullpromo[longitud[contador]][21]);
        consulta2.addParameter('msto',TYPES.Char,fullpromo[longitud[contador]][22]);
        consulta2.addParameter('ucon',TYPES.Float,fullpromo[longitud[contador]][23]);
        consulta2.addParameter('ucom',TYPES.Char,fullpromo[longitud[contador]][24]);
        consulta2.addParameter('obse',TYPES.VarChar,fullpromo[longitud[contador]][25]);
        conexion.callProcedure(consulta2);
    }    
}
// let minibucle=(res,dataenviada,objtotal,totalisado,tcm,formato,longitud,orden,contador)=>{
let minibucle=(res,ncoti,fullpromo,longitud,contador)=>{
    if(longitud.length<=contador){
        // direccion(res,dataenviada,objtotal,totalisado,tcm,formato,contador)
        conexion.close();
        res.status(200).send("anidamiento exitoso")
    }
    else{
        // minibucle(res,ncoti,fullpromo,longitud,contador+1)
        let sp_sql="GrabaDTLCotFacWeb";
        let consulta2=new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            // else{ minibucle(res,dataenviada,objtotal,totalisado,tcm,formato,longitud,orden,contador+1); }
            else{ minibucle(res,ncoti,fullpromo,longitud,contador+1); }
        })
        consulta2.addParameter('cdocu',TYPES.Char,fullpromo[longitud[contador]][1]);
        consulta2.addParameter('ndocu',TYPES.Char,fullpromo[longitud[contador]][2]);
        consulta2.addParameter('codcli',TYPES.Char,fullpromo[longitud[contador]][3]);
        consulta2.addParameter('tcam',TYPES.Float,fullpromo[longitud[contador]][4]);
        consulta2.addParameter('mone',TYPES.Char,fullpromo[longitud[contador]][5]);
        consulta2.addParameter('moneitm',TYPES.Char,fullpromo[longitud[contador]][6]);
        consulta2.addParameter('aigv',TYPES.Char,fullpromo[longitud[contador]][7]);
        consulta2.addParameter('item',TYPES.Float,fullpromo[longitud[contador]][8]);
        consulta2.addParameter('codi',TYPES.Char,fullpromo[longitud[contador]][9]);
        consulta2.addParameter('codf',TYPES.Char,fullpromo[longitud[contador]][10]);
        consulta2.addParameter('marc',TYPES.Char,fullpromo[longitud[contador]][11]);
        consulta2.addParameter('umed',TYPES.Char,fullpromo[longitud[contador]][12]);
        consulta2.addParameter('descr',TYPES.Char,fullpromo[longitud[contador]][13]);
        consulta2.addParameter('cant',TYPES.Float,fullpromo[longitud[contador]][14]);
        consulta2.addParameter('preu',TYPES.Float,fullpromo[longitud[contador]][15]);
        consulta2.addParameter('tota',TYPES.Float,fullpromo[longitud[contador]][16]);
        consulta2.addParameter('dsct',TYPES.Float,fullpromo[longitud[contador]][17]);
        consulta2.addParameter('totn',TYPES.Float,fullpromo[longitud[contador]][18]);
        consulta2.addParameter('AnulaDetalle',TYPES.Char,'');
        consulta2.addParameter('codalm',TYPES.Char,fullpromo[longitud[contador]][19]);
        consulta2.addParameter('cost',TYPES.Float,fullpromo[longitud[contador]][20]);
        consulta2.addParameter('msto',TYPES.Char,fullpromo[longitud[contador]][21]);
        consulta2.addParameter('ucon',TYPES.Float,fullpromo[longitud[contador]][22]);
        consulta2.addParameter('ucom',TYPES.Char,fullpromo[longitud[contador]][23]);
        consulta2.addParameter('obse',TYPES.VarChar,fullpromo[longitud[contador]][24]);
        conexion.callProcedure(consulta2);
    }    
}

module.exports={addprom}