require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let crear = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {cliente,productos,promos} = req.body;
    console.log(req.body);
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? calcular(res,req.body) : res.status(401).send(vendedor_data);
}

let calcular = (res,dataenviada) => {
    let objtotal={};
    let totalisado=0;
    for(let indice in dataenviada["productos"]){
        let descripcion=dataenviada["productos"][indice][0];
        let cantidad=parseInt(dataenviada["productos"][indice][1]);
        let costo=parseFloat(dataenviada["productos"][indice][2]).toFixed(2);
        let preu=parseFloat(dataenviada["productos"][indice][3]);
        let dsct=parseFloat(dataenviada["productos"][indice][4]);
        let codf=dataenviada["productos"][indice][5];
        let marca=dataenviada["productos"][indice][6];
        let saca_descuento=dsct/100;
        let saca_tota_por_descuento=(preu*saca_descuento).toFixed(2);
        let saca_tota_con_descuento=(preu-saca_tota_por_descuento).toFixed(2);
        let saca_total=saca_tota_con_descuento*cantidad;
        let total_solo_item=saca_total.toFixed(2);
        let total_solo_item_igv=(saca_total*0.18).toFixed(2);
        let total_solo_item_conigv=(saca_total*1.18).toFixed(2);
        // objtotal[indice]=[total_solo_item,total_solo_item_igv,total_solo_item_conigv];
        ////creacion del molde para el objeto globlal de productos
        objtotal[indice]=[codf,marca,descripcion,cantidad,preu,total_solo_item,dsct,total_solo_item_conigv,costo];
        totalisado+=saca_total;
    }

    if(objevacio(dataenviada["promos"])==false){
        for(let indice in dataenviada["promos"]){
            let prom_sin_igv=(dataenviada["promos"][indice][3]/1.18).toFixed(2);
            let prom_sin_igv_x_cantidad=(prom_sin_igv*dataenviada["productos"][indice][1]).toFixed(2);
            totalisado=totalisado-prom_sin_igv_x_cantidad;
        }
    }
    bd_conexion(res,dataenviada,objtotal,totalisado);
}

let bd_conexion=(res,dataenviada,objtotal,totalisado)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ tip_cambio(res,dataenviada,objtotal,totalisado); }
    });
}

let tip_cambio=(res,dataenviada,objtotal,totalisado)=>{
    // let sp_sql="select tcvta from tbl01tca where CONVERT(char(10),fecha,111)=CONVERT(char(10),GETDATE(),111)";
    let sp_sql="select tcvta,fecha from tbl01tca where CONVERT(char(10),fecha,111)=CONVERT(char(10),GETDATE(),111)"
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            if(rows.length==0) res.status(401).send("sin resultados?");
            else{
                let tcm=parseFloat(rows[0][0]["value"]);
                let fecha=rows[0][1]["value"];
                numero_coti(res,dataenviada,objtotal,totalisado,tcm,fecha);
            }
        }
    })
    conexion.execSql(consulta);
}

let numero_coti = (res,dataenviada,objtotal,totalisado,tcm,fecha)=>{
    let sp_sql="select top 1 RIGHT(ndocu,8) as nroactual from mst01cot where LEFT(ndocu,3)='009' order by RIGHT(ndocu,8) desc";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            if(rows.length==0) res.status(401).send("sin resultados?");
            else{
                let comodin="009-00";
                let n_actual = parseInt(rows[0][0]["value"]);
                let n_calcular=n_actual+1;
                let formato=comodin+n_calcular.toString();
                // cabesera(res,dataenviada,objtotal,totalisado,tcm,fecha,formato);
                // correlativo(res,dataenviada,objtotal,totalisado,tcm,fecha,formato);
                atencion(res,dataenviada,objtotal,totalisado,tcm,fecha,formato);
            }
        }
    })
    conexion.execSql(consulta);
}
//////AGREGAR LA ATTECION PORQE SINO NO PASA A PEDIDO
let atencion=(res,dataenviada,objtotal,totalisado,tcm,fecha,formato)=>{
    let sp_sql="select top 1 Nomcon from dtl01con where Codn=@codcli and flagcontcompra=1";
    let consulta2 = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){console.log(err);res.status(401).send("error interno"); }
        else{
            let atencion=rows[0][0]["value"];
            correlativo(res,dataenviada,objtotal,totalisado,tcm,fecha,formato,atencion);
        }
    })
    consulta2.addParameter('codcli',TYPES.VarChar,dataenviada["cliente"][0]);
    conexion.execSql(consulta2);
}

////AGREGAR LA SUMA DEL CORRELATIVO 
let correlativo=(res,dataenviada,objtotal,totalisado,tcm,fecha,formato,atencion)=>{
    let sp_sql="update tbl01cor set nroini=@correlativo where cdocu='31'";
    let consulta2 = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){console.log(err);res.status(401).send("error interno"); }
        else{ cabesera(res,dataenviada,objtotal,totalisado,tcm,fecha,formato,atencion); }
    })
    consulta2.addParameter('correlativo',TYPES.Char,formato);
    conexion.execSql(consulta2);
}
//////////
let cabesera = (res,dataenviada,objtotal,totalisado,tcm,fecha,formato,atencion) => {
    // let sp_sql="GrabaMstCotFacWeb"
    let sp_sql="GrabaMstCotFac"
    let consulta2 = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){console.log(err);res.status(401).send("error interno"); }
        else{
            // conexion.close();
            // detallado(res,dataenviada,objtotal,totalisado,tcm,formato);
            console.log("cabesera creada")
            detallado_bucle(res,dataenviada,objtotal,totalisado,tcm,fecha,formato);
        }
    })
    consulta2.addParameter('fecha',TYPES.DateTime,fecha);
    consulta2.addParameter('cdocu',TYPES.Char,'31');
    consulta2.addParameter('ndocu',TYPES.Char,formato);
    consulta2.addParameter('codcli',TYPES.Char,dataenviada["cliente"][0]);///SACAR DEL CLIENTE
    consulta2.addParameter('nomcli',TYPES.Char,dataenviada["cliente"][1]);///SACAR DEL CLIENTE
    consulta2.addParameter('ruccli',TYPES.Char,dataenviada["cliente"][2]);///SACAR DEL CLIENTE
    consulta2.addParameter('atte',TYPES.Char,atencion);///SACAR DEL CLIENTE
    consulta2.addParameter('nrefe',TYPES.Char,'');
    consulta2.addParameter('requ',TYPES.Char,'');
    consulta2.addParameter('mone',TYPES.Char,'D');///SACAR DEL CLIENTE
    consulta2.addParameter('tcam',TYPES.Float,tcm);///CREAR LA CONSULTA
    // consulta2.addParameter('tcme',TYPES.Float,tcm);///CREAR LA CONSULTA
    consulta2.addParameter('tota',TYPES.Float,totalisado);///SACAR DEL CLIENTE
    consulta2.addParameter('toti',TYPES.Float,(totalisado*0.18).toFixed(2));///SACAR DEL CLIENTE
    consulta2.addParameter('totn',TYPES.Float,(totalisado*1.18).toFixed(2));///SACAR DEL CLIENTE
    consulta2.addParameter('flag',TYPES.Char,'0');
    consulta2.addParameter('codven',TYPES.VarChar,dataenviada["cliente"][3]);///SACAR DEL CLIENTE
    // consulta2.addParameter('codven_usu',TYPES.VarChar,dataenviada["cliente"][3]);///SACAR DEL CLIENTE
    consulta2.addParameter('codcdv',TYPES.VarChar,dataenviada["cliente"][4]);///SACAR DEL CLIENTE
    consulta2.addParameter('cond',TYPES.Char,'');
    consulta2.addParameter('fven',TYPES.VarChar,'2024-12-14');///cuidado con este
    consulta2.addParameter('dura',TYPES.Float,10);
    consulta2.addParameter('cOperacion',TYPES.Char,'Nuevo');
    consulta2.addParameter('obser',TYPES.Char,'');///identificador para diferenciar
    consulta2.addParameter('estado',TYPES.Char,'0');
    consulta2.addParameter('obsere',TYPES.Char,'');
    consulta2.addParameter('word',TYPES.Int,0);
    consulta2.addParameter('obser2',TYPES.Char,'');
    consulta2.addParameter('dirent',TYPES.VarChar,'');
    consulta2.addParameter('codscc',TYPES.Char,'00');
    // consulta2.addParameter('tipent',TYPES.Char,'0');///PARA SABER Q TIPO DE DESPACHO ES
    // consulta2.addParameter('origen',TYPES.Int,0);
    // consulta2.addParameter('idusuario',TYPES.Int,0);
    // consulta2.addParameter('frontera',TYPES.Int,0);
    conexion.callProcedure(consulta2);
}

let detallado_bucle = (res,dataenviada,objtotal,totalisado,tcm,fecha,formato) => {
    let contador=0;
    let orden=[];
    for(let indice in objtotal){orden.push(indice);}
    minibucle(res,dataenviada,objtotal,totalisado,tcm,fecha,formato,orden.length,orden,contador);
}

let minibucle=(res,dataenviada,objtotal,totalisado,tcm,fecha,formato,longitud,orden,contador)=>{
    if(longitud<=contador){
        direccion(res,dataenviada,objtotal,totalisado,tcm,formato,contador)
        // conexion.close();
        // res.status(200).send("recursion completa")
    }
    else{
        let sp_sql="GrabaDTLCotFacWeb";
        let consulta2=new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            else{ minibucle(res,dataenviada,objtotal,totalisado,tcm,fecha,formato,longitud,orden,contador+1); }
        })
        consulta2.addParameter('cdocu',TYPES.Char,'31');
        consulta2.addParameter('ndocu',TYPES.Char,formato);
        consulta2.addParameter('codcli',TYPES.Char,dataenviada["cliente"][0]);
        consulta2.addParameter('tcam',TYPES.Float,tcm);
        consulta2.addParameter('mone',TYPES.Char,'D');
        consulta2.addParameter('moneitm',TYPES.Char,'D');
        consulta2.addParameter('aigv',TYPES.Char,'S');
        consulta2.addParameter('item',TYPES.Float,contador+1);
        consulta2.addParameter('codi',TYPES.Char,orden[contador]);
        consulta2.addParameter('codf',TYPES.Char,objtotal[orden[contador]][0]);
        consulta2.addParameter('marc',TYPES.Char,objtotal[orden[contador]][1]);
        consulta2.addParameter('umed',TYPES.Char,'UND');
        consulta2.addParameter('descr',TYPES.Char,objtotal[orden[contador]][2]);
        consulta2.addParameter('cant',TYPES.Float,objtotal[orden[contador]][3]);
        consulta2.addParameter('preu',TYPES.Float,objtotal[orden[contador]][4]);
        consulta2.addParameter('tota',TYPES.Float,objtotal[orden[contador]][5]);
        consulta2.addParameter('dsct',TYPES.Float,objtotal[orden[contador]][6]);
        consulta2.addParameter('totn',TYPES.Float,objtotal[orden[contador]][7]);
        consulta2.addParameter('AnulaDetalle',TYPES.Char,'');
        consulta2.addParameter('codalm',TYPES.Char,dataenviada["alm"]);
        consulta2.addParameter('cost',TYPES.Float,objtotal[orden[contador]][8]);
        consulta2.addParameter('msto',TYPES.Char,'S');
        consulta2.addParameter('ucon',TYPES.Float,1.000);
        consulta2.addParameter('ucom',TYPES.Char,'UND');
        consulta2.addParameter('obse',TYPES.VarChar,'');
        conexion.callProcedure(consulta2);
    }    
}
////CORTA AQUI SI NO EXISTE PROMOS
let direccion=(res,dataenviada,objtotal,totalisado,tcm,formato,nitem)=>{
    if(objevacio(dataenviada["promos"])==false){ resolver_promos(res,dataenviada,objtotal,totalisado,tcm,formato,nitem); }
    else{
        conexion.close();
        res.status(200).send("recursion completa")
    }
}

let resolver_promos=(res,dataenviada,objtotal,totalisado,tcm,formato,nitem)=>{
    let objetotalpromos={};
    let total=0;
    let comodin_dsc='DSCTO/PROM: ';
    for(let indice in dataenviada["promos"]){
        let descripcion_acomodada=comodin_dsc+dataenviada["promos"][indice][1]+'/'+dataenviada["promos"][indice][0];
        let prom_tota=((dataenviada["promos"][indice][3]*-1)/1.18);
        if(descripcion_acomodada.length>80){
            let descripcion_ajustada=descripcion_acomodada.substring(0,80);
            objetotalpromos[indice]=['DS00','0303-010001',descripcion_ajustada,parseInt(dataenviada["productos"][indice][1]),dataenviada["promos"][indice][3]*-1,prom_tota];
        }
        else{objetotalpromos[indice]=['DS00','0303-010001',descripcion_acomodada,parseInt(dataenviada["productos"][indice][1]),dataenviada["promos"][indice][3]*-1,prom_tota];}
    }
    detallado_prom(res,dataenviada,objtotal,totalisado,tcm,formato,objetotalpromos,nitem);
}

let detallado_prom = (res,dataenviada,objtotal,totalisado,tcm,formato,objetotalpromos,nitem) => {
    let contador=0;
    let orden=[];
    for(let indice in objetotalpromos){orden.push(indice);}
    bucle_prom(res,dataenviada,objtotal,objetotalpromos,totalisado,tcm,formato,orden.length,orden,contador,nitem);
}

let bucle_prom=(res,dataenviada,objtotal,objetotalpromos,totalisado,tcm,formato,longitud,orden,contador,nitem)=>{
    if(longitud<=contador){
        conexion.close();
        // res.status(200).send("recursion promo completa")
        res.status(200).json({"resultado":"recursion promo completa"})
    }
    else{
        let sp_sql="GrabaDTLCotFacWeb";
        let consulta2=new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            else{ bucle_prom(res,dataenviada,objtotal,objetotalpromos,totalisado,tcm,formato,longitud,orden,contador+1,nitem+1); }
        })
        consulta2.addParameter('cdocu',TYPES.Char,'31');
        consulta2.addParameter('ndocu',TYPES.Char,formato);
        consulta2.addParameter('codcli',TYPES.Char,dataenviada["cliente"][0]);
        consulta2.addParameter('tcam',TYPES.Float,tcm);
        consulta2.addParameter('mone',TYPES.Char,'D');
        consulta2.addParameter('moneitm',TYPES.Char,'D');
        consulta2.addParameter('aigv',TYPES.Char,'S');
        consulta2.addParameter('item',TYPES.Float,nitem+1);
        consulta2.addParameter('codi',TYPES.Char,objetotalpromos[orden[contador]][1]);
        consulta2.addParameter('codf',TYPES.Char,objetotalpromos[orden[contador]][0]);
        consulta2.addParameter('marc',TYPES.Char,'');
        consulta2.addParameter('umed',TYPES.Char,'');
        consulta2.addParameter('descr',TYPES.Char,objetotalpromos[orden[contador]][2]);
        consulta2.addParameter('cant',TYPES.Float,objetotalpromos[orden[contador]][3]);
        consulta2.addParameter('preu',TYPES.Float,(objetotalpromos[orden[contador]][5]*objetotalpromos[orden[contador]][3]).toFixed(2));
        consulta2.addParameter('tota',TYPES.Float,(objetotalpromos[orden[contador]][5]*objetotalpromos[orden[contador]][3]).toFixed(2));
        consulta2.addParameter('dsct',TYPES.Float,0.000);
        consulta2.addParameter('totn',TYPES.Float,(objetotalpromos[orden[contador]][4]*objetotalpromos[orden[contador]][3]).toFixed(2));
        consulta2.addParameter('AnulaDetalle',TYPES.Char,'');
        consulta2.addParameter('codalm',TYPES.Char,'01');
        consulta2.addParameter('cost',TYPES.Float,0.000);
        consulta2.addParameter('msto',TYPES.Char,'N');
        consulta2.addParameter('ucon',TYPES.Float,1.000);
        consulta2.addParameter('ucom',TYPES.Char,'UND');
        consulta2.addParameter('obse',TYPES.VarChar,'');
        conexion.callProcedure(consulta2);
    }
}

module.exports={crear}