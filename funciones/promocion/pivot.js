require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let pivot = (req,res,next) => {
    let {ncoti} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    // typeof vendedor_data=='string' ? bd_conexion(res,nprom,next) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,ncoti) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,ncoti)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta3(res,ncoti); }
    });
}

let bd_consulta = (res,ncoti,nprom,next)=>{
    let sp_sql="select STRING_AGG(CONCAT('[',idprom,']') ,',' ) as 'concatenacion' from mst_promocion where estado=1";
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
                console.log(respuesta2[0]);
                let promos_activas=respuesta2[0][0].split(',');
                prom_repetida(res,promos_activas);
            }
        }
    })
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

let bd_consulta3 = (res,ncoti)=>{
    let sp_sql="select CONVERT(varchar,fecha,120) as fecha,cdocu,ndocu,codcli,tcam,mone,moneitm,aigv,item,codi,codf,marc,umed,descr,cant,preu,tota,dsct,totn,codalm,cost,msto,ucon,ucom,obse from dtl01cot where ndocu=@coti order by item";
        let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ res.status(401).send("error interno"); }
            else{
                if(rows.length==0) res.status(401).send("no existe coti");
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
                    console.log(respuesta2);
                    bd_consulta2(res,ncoti,respuesta2);
                    // let cadenitajson=JSON.stringify(respuesta2);
                    // res.status(200).json(cadenitajson);
                }
            }
        })
        consulta.addParameter('coti',TYPES.VarChar,ncoti);
        conexion.execSql(consulta);
}

let bd_consulta2 = (res,ncoti,respuesta2)=>{
    let codi_recolector=[];
    for(let codi in respuesta2){
        codi_recolector.push(respuesta2[codi][9]);
    }
    console.log(codi_recolector);
    let contador=1;
    // let sp_sql="select a.idprom,b.codi from mst_promocion a join dtl_promocion_progra b on b.idprom=a.idprom where a.estado=1 group by a.idprom,b.codi";
    let sp_sql="select a.idprom,b.codi from mst_promocion a join dtl_promocion_progra b on b.idprom=a.idprom where a.estado=1 AND b.codi in(";
    for(let codi of codi_recolector){
        console.log(typeof codi);
        console.log(codi);
        if(contador>=codi_recolector.length){
            sp_sql+="'"+codi+"'"+') group by a.idprom,b.codi';
        }
        else{
            sp_sql+="'"+codi+"'"+',';
        }
        contador++;
    }
    // console.log(sp);

    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
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
                console.log(respuesta2);
                let nuevoobj={};
                let filtro_final=[];
                let nueva_programacion=respuesta.forEach((programacion)=>{
                    if(Object.hasOwn(nuevoobj,programacion[1])){
                        nuevoobj[programacion[1]]+="/"+programacion[0];
                    }
                    else{ nuevoobj[programacion[1]]=String(programacion[0])}
                })
                console.log(nuevoobj);
                Object.values(nuevoobj).forEach((valor)=>{
                    let separador=valor.split('/');
                    for(let idprom of separador){
                        if(filtro_final.includes(idprom)){}
                        else{filtro_final.push(idprom)}
                    }
                })
                console.log(filtro_final);
                res.status(200).json(filtro_final)
                // prom_repetida(res,promos_activas);
            }
        }
    })
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

let prom_repetida=(res,promos_activas)=>{
    let cadena_superior="select codi,";
    let cadena_inferior="";
    for(let idpro of promos_activas){
        cadena_inferior+=idpro+',';
        cadena_superior+=idpro+',';
    }    
    let cadena_limpia=cadena_superior.substring(0,cadena_superior.length-1);
    
    cadena_limpia+=" from (select b.codi,b.idprom from mst_promocion a join dtl_promocion_progra b on (b.idprom=a.idprom) where a.estado=1 group by b.codi,b.idprom) as sourcetable";

    cadena_limpia+=" PIVOT( COUNT(idprom) for idprom IN (";

    cadena_limpia+=cadena_inferior.substring(0,cadena_inferior.length-1);

    cadena_limpia+=")) as pivottable";

    console.log(cadena_limpia);

    let sp_sql="";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            // if(rows.length==0) next();
            // else{ res.status(200).send("promo ya aplicada") }
            rows.length==0 ? next() : res.status(200).send("promo ya aplicada")
        }
    })
    consulta.addParameter('idprom',TYPES.VarChar,idprom);
    conexion.execSql(consulta);
}

module.exports={pivot}