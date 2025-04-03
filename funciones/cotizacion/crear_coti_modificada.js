require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let crear_modificacion = (req,res,next) => {
    /////RECALCULA LA CABESERA PRIMERO PARA EL UPDATE
    // let valid_coki = req.signedCookies;
    let {item} = req.body;
    console.log(item);
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? calcular(res,item) : res.status(401).send(vendedor_data);
}

let calcular = (res,dataenviada) => {
    let documento='';
    let totalisado=0;
    let ordenador=1;
    for(let itm in dataenviada){
        dataenviada[itm][8]=ordenador;
        totalisado+=parseFloat(dataenviada[itm][16]);
        if(documento==='') documento=dataenviada[itm][2];
        ordenador++;
    }
    let totalsoloigv=parseFloat((totalisado*0.18).toFixed(2));
    let totalconigv=parseFloat((totalisado*1.18).toFixed(2));
   
    bd_conexion(res,dataenviada,totalisado,totalconigv,totalsoloigv,documento);
}

let bd_conexion=(res,dataenviada,totalisado,totalconigv,totalsoloigv,documento)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{
            // cabesera(res,dataenviada,totalisado,totalconigv,totalsoloigv,documento)
            deletear_detallado(res,dataenviada,totalisado,totalconigv,totalsoloigv,documento)
        }
    });
}

let deletear_detallado=(res,dataenviada,totalisado,totalconigv,totalsoloigv,documento)=>{
    let sp_sql="delete from dtl01cot where ndocu=@doc"
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            cabesera(res,dataenviada,totalisado,totalconigv,totalsoloigv,documento);
        }
    })
    consulta.addParameter('doc',TYPES.VarChar,documento);
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

//////////
let cabesera = (res,dataenviada,totalisado,totalconigv,totalsoloigv,documento) => {
    // let parseado1=String(totalisado);
    // let parseado2=String(totalconigv);
    // let parseado3=String(totalsoloigv);
    let sp_sql="update mst01cot set tota=@totalisado,toti=@totaligv,totn=@totalconigv where ndocu=@doc";
    let consulta2 = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){console.log(err);res.status(401).send("error interno"); }
        else{
            detallado_bucle(res,dataenviada);
        }
    })
    consulta2.addParameter('totalisado',TYPES.VarChar,totalisado.toString());
    consulta2.addParameter('totaligv',TYPES.VarChar,totalsoloigv.toString());
    consulta2.addParameter('totalconigv',TYPES.VarChar,totalconigv.toString());
    consulta2.addParameter('doc',TYPES.VarChar,documento);
    conexion.execSql(consulta2);
    // conexion.callProcedure(consulta2);
}

let detallado_bucle = (res,dataenviada) => {
    let contador=0;
    let orden=[];
    for(let indice in dataenviada){orden.push(dataenviada[indice]);}
    // minibucle(res,dataenviada,contador);
    minibucle(res,dataenviada,contador,orden);
}

let minibucle=(res,dataenviada,contador,orden)=>{
    if(Object.keys(dataenviada).length<=contador){
        // direccion(res,dataenviada,objtotal,totalisado,tcm,formato,contador)
        conexion.close();
        res.status(200).send("recursion completa")
    }
    else{
        let sp_sql="GrabaDTLCotFac";
        let consulta2=new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            else{ minibucle(res,dataenviada,contador+1,orden); }
        })
        consulta2.addParameter('fecha',TYPES.DateTime,orden[contador][0]);
        consulta2.addParameter('cdocu',TYPES.Char,orden[contador][1]);
        consulta2.addParameter('ndocu',TYPES.Char,orden[contador][2]);
        consulta2.addParameter('codcli',TYPES.Char,orden[contador][3]);
        consulta2.addParameter('tcam',TYPES.Float,orden[contador][4]);
        consulta2.addParameter('mone',TYPES.Char,orden[contador][5]);
        consulta2.addParameter('moneitm',TYPES.Char,orden[contador][6]);
        consulta2.addParameter('aigv',TYPES.Char,orden[contador][7]);
        consulta2.addParameter('item',TYPES.Float,orden[contador][8]);
        consulta2.addParameter('codi',TYPES.Char,orden[contador][9]);
        consulta2.addParameter('codf',TYPES.Char,orden[contador][10]);
        consulta2.addParameter('marc',TYPES.Char,orden[contador][11]);
        consulta2.addParameter('umed',TYPES.Char,orden[contador][12]);
        consulta2.addParameter('descr',TYPES.Char,orden[contador][13]);
        consulta2.addParameter('cant',TYPES.Float,orden[contador][14]);
        consulta2.addParameter('preu',TYPES.Float,orden[contador][15]);
        consulta2.addParameter('tota',TYPES.Float,orden[contador][16]);
        consulta2.addParameter('dsct',TYPES.Float,orden[contador][17]);
        consulta2.addParameter('totn',TYPES.Float,orden[contador][18]);
        consulta2.addParameter('AnulaDetalle',TYPES.Char,'');
        consulta2.addParameter('codalm',TYPES.Char,orden[contador][19]);
        // consulta2.addParameter('codalm',TYPES.Char,'01');
        consulta2.addParameter('cost',TYPES.Float,orden[contador][20]);
        consulta2.addParameter('msto',TYPES.Char,orden[contador][21]);
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

module.exports={crear_modificacion}