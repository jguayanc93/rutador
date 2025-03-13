require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

// const posibilidades = require('./combinaciones.js');
// const {posibilidades,buscador_tipo} = require('./combinaciones.js');
const {posibilidades,buscador_tipo,buscador_metrica,buscador_grupo} = require('./combinaciones.js');

const dsct_aplicado = require('./tipo113.js');
const bonificacion_aplicada = require('./tipo131.js');
const dsct_aplicado_conjunto = require('./tipo313.js');
const bonificacion_aplicada_conjunto = require('./tipo331.js');
const {agrupador}=require('./agrupador.js')////debe tomar la mejor promocion
/////EN PRUEBA EL SEPARADOR DE CONDICIONES DE PROMOCIONES
const v_xitems=require('./venta_item.js')
const v_xitotalisado=require('./venta_total.js')
////DIFERENCIAR EL TIPO DE DESCUENTO OBTENIDO
const descuento = require('./descuento.js')
const bonificacion = require('./bonificacion')

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let analisarprom = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {ncoti,nprom,grupos} = req.body;
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,ncoti,nprom,grupos) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,ncoti,nprom,grupos)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,ncoti,nprom,grupos); }
    });
}

let bd_consulta = (res,ncoti,nprom,grupos)=>{
    // let sp_sql="select codi,codf,descr,cant,tota,totn from dtl01cot where ndocu=@coti order by item";
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
                prom_cabesera(res,nprom,respuesta2,grupos);
                // let cadenitajson=JSON.stringify(respuesta2);
                // res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('coti',TYPES.VarChar,ncoti);
    conexion.execSql(consulta);
}

let prom_cabesera=(res,nprom,cotdetalle,grupos)=>{
    //let sp_sql="select idprom,nomprom,desprom,porvta,tipdsct,tipdsctoto,metrica,undvtaprom from mst_promocion where estado=1 and idprom=@nprom";
    let sp_sql="select idprom,nomprom,desprom,porvta,tipdsct,tipdsctoto,metrica,undvtaprom,lpdsct,idagrupa,prioagrupa from mst_promocion where estado=1 and idprom=@nprom";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error promcabesera"); }
        else{
            // conexion.close();
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
                // let buscar_tipo=[respuesta2[0][3],respuesta2[0][4],respuesta2[0][5]];
                let encontrado=buscador_tipo(respuesta2[0]);
                let numero_metrica=buscador_metrica(respuesta2[0]);
                let saber_grupo=buscador_grupo(respuesta2[0]);
                console.log("aqui mira");
                //console.log(respuesta2[0]);
                console.log(encontrado);
                ///PUNTO DE DIFERENCIA PARA AGRUPARLO CON OTRAS PROMOS
                if(saber_grupo!=0 && encontrado[0]==3){
                    if(!grupos.includes(saber_grupo)){
                        agrupador(res,cotdetalle,saber_grupo);
                    }
                    else{
                        res.status(200).json({})
                    }
                    // agrupador(res,cotdetalle,saber_grupo);
                }
                else{
                    prom_detallado(res,nprom,cotdetalle,respuesta2[0],encontrado,numero_metrica);
                }
                /////////////////
                // prom_detallado(res,nprom,cotdetalle,respuesta2[0],encontrado,numero_metrica);
            }
        }
    })
    consulta.addParameter('nprom',TYPES.VarChar,nprom);
    conexion.execSql(consulta);
}

let prom_detallado=(res,nprom,cotdetalle,promcabesa,tipopromo,tipometrica)=>{
    // let sp_sql="select a.codi,a.monto,a.dsct,a.boncodf,a.stoclim,b.marc from dtl_promocion_progra a join prd0101 b on a.codi=b.codi where idprom=@nprom";
    // let sp_sql="select a.codi,a.monto,a.dsct,a.boncodf,a.stoclim,b.marc,b.codi,b.pcus from dtl_promocion_progra a join prd0101 b on a.codi=b.codi where idprom=@nprom";
    let sp_sql="select a.codi,a.monto,a.dsct,a.boncodf,a.stoclim,b.marc,a.idprom,b.pcus from dtl_promocion_progra a join prd0101 b on a.codi=b.codi where idprom=@nprom";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error promdetalle"); }
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
                // console.log(respuesta2);
                // prom_acomodar(res,nprom,cotdetalle,promcabesa,respuesta2,tipopromo,tipometrica);
                // direccionador(res,nprom,cotdetalle,promcabesa,respuesta2,tipopromo,tipometrica);
                direccionador2(res,nprom,cotdetalle,promcabesa,respuesta2,tipopromo,tipometrica);
            }
        }
    })
    consulta.addParameter('nprom',TYPES.VarChar,nprom);
    conexion.execSql(consulta);
}

// let cantidad_bonitem=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,codis_aprobados,cantidad_regalo)=>{
//     // let sp_sql="select b.codf,b.marc,b.descr,b.pcus from dtl_promocion_bonitem a join prd0101 b on b.codf=a.boncodf where a.idprom='10537' and a.codi='0505-010045' order by a.positem";
//     let sp_sql="select b.codi,b.codf,b.marc,b.descr,b.pcus from dtl_promocion_bonitem a join prd0101 b on b.codf=a.boncodf where a.idprom=@nprom and a.codi=@codi order by a.positem";
//         let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
//             if(err){ res.status(401).send("error promdetalle"); }
//             else{
//                 // conexion.close();
//                 if(rows.length==0) res.status(401).send("sin resultados?");
//                 else{
//                     let respuesta=[];
//                     let respuesta2={};
//                     let contador=0;
//                     rows.forEach(fila=>{
//                         let tmp={};
//                         fila.map(data=>{
//                             if(contador>=fila.length) contador=0;
//                             typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value;
//                             contador++;
//                         })
//                         respuesta.push(tmp);
//                     });
//                     Object.assign(respuesta2,respuesta);
//                     console.log("esto deberia ser el objeto con todos sus regalos respectivos");
//                     console.log(respuesta2);
//                     final_331(res,nprom,cotdetalle,promcabesa,respuesta2,tipopromo,tipometrica,codis_aprobados,cantidad_regalo,respuesta2);
//             }
//         }
//     })
//     consulta.addParameter('nprom',TYPES.VarChar,nprom);
//     consulta.addParameter('codi',TYPES.VarChar,codis_aprobados[0]);
//     conexion.execSql(consulta);
// }

let direccionador2=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica)=>{
    let respuesta_devuelta;
    let promo_terminada;
    tipopromo[0]==1 ? respuesta_devuelta=v_xitems(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica) : respuesta_devuelta=v_xitotalisado(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica);
    console.log("esto regreso despues de mandarlo al filtro de promociones")
    console.log(respuesta_devuelta);
    console.log("esto es el tipo de promo")
    console.log(tipopromo)
    if(tipopromo[1]==1){
        // promo_terminada=descuento(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,respuesta_devuelta[0],respuesta_devuelta[1]);
        // descuento(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,respuesta_devuelta[0],respuesta_devuelta[1],respuesta_devuelta[2],respuesta_devuelta[3],respuesta_devuelta[4]);
        descuento(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,respuesta_devuelta);
    }
    else{
        // promo_terminada=bonificacion(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,items_validos2,items_promos2);
        // bonificacion(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,respuesta_devuelta[0],respuesta_devuelta[1],respuesta_devuelta[2]);
        bonificacion(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,respuesta_devuelta);
    }
    // res.status(200).json(respuesta_devuelta)
    // res.status(200).json(promo_terminada)
}

let direccionador=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica)=>{
    if(tipopromo.toString()==posibilidades["tipo113"].toString()){
        dsct_aplicado(res,nprom,cotdetalle,promcabesa,promdetalle);
    }
    else if(tipopromo.toString()==posibilidades["tipo131"].toString()){
        bonificacion_aplicada(res,nprom,cotdetalle,promcabesa,promdetalle);
    }
    else if(tipopromo.toString()==posibilidades["tipo313"].toString()){
        dsct_aplicado_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle);
    }
    else if(tipopromo.toString()==posibilidades["tipo331"].toString()){
        // bonificacion_aplicada_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle);
        let buscar_regalos=bonificacion_aplicada_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle,tipometrica);
        let codis_aprobados=Object.keys(buscar_regalos[0]);
        cantidad_bonitem(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,codis_aprobados,buscar_regalos[1]);
    }
}

let cantidad_bonitem=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,codis_aprobados,cantidad_regalo)=>{
    // let sp_sql="select b.codf,b.marc,b.descr,b.pcus from dtl_promocion_bonitem a join prd0101 b on b.codf=a.boncodf where a.idprom='10537' and a.codi='0505-010045' order by a.positem";
    let sp_sql="select b.codi,b.codf,b.marc,b.descr,b.pcus from dtl_promocion_bonitem a join prd0101 b on b.codf=a.boncodf where a.idprom=@nprom and a.codi=@codi order by a.positem";
    // let sp_sql="select b.codi,b.codf,b.marc,b.descr,b.pcus,b.msto,b.aigv from dtl_promocion_bonitem a join prd0101 b on (b.codf=a.boncodf) where a.idprom='10616' and a.codi='0505-011931' order by a.positem";
        let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ res.status(401).send("error promdetalle"); }
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
                    console.log("esto deberia ser el objeto con todos sus regalos respectivos");
                    console.log(respuesta2);
                    final_331(res,nprom,cotdetalle,promcabesa,respuesta2,tipopromo,tipometrica,codis_aprobados,cantidad_regalo,respuesta2);
            }
        }
    })
    consulta.addParameter('nprom',TYPES.VarChar,nprom);
    consulta.addParameter('codi',TYPES.VarChar,codis_aprobados[0]);
    conexion.execSql(consulta);
}

let final_331=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,codis_aprobados,cantidad_regalo,bonitems)=>{
    //////FALTA UN FOR PARA SABER EN Q NUMERO DE ITEM SE ENCUENTRA
    let numero_item=1;
    for(let i in cotdetalle){ numero_item++; }

    let comodin_bon="GRATIS/PROM:(P#";
    let descripcion_acomodada="";
    let bon_arreglado={};
    let items_validos2={};
    let aigv="S";
    for(let i in bonitems){
        // let comodin_completo=comodin_bon+promcabesa[0]+")"+bonitems[i][3]+"(BON)";
        let comodin_completo=comodin_bon+promcabesa[0]+")"+bonitems[i][3];
        if(comodin_completo.length>80){
            descripcion_acomodada=comodin_completo.substring(0,75);
            descripcion_acomodada=descripcion_acomodada+"(BON)";
        }
        else{
            if(comodin_completo.length>75){
                descripcion_acomodada=comodin_completo.substring(0,75);
                descripcion_acomodada=descripcion_acomodada+"(BON)";
            }
            else{descripcion_acomodada=comodin_completo+"(BON)";}
        }

        if(bonitems[i][0].substring(0,2)=='03') aigv="N"
        // bon_arreglado[bonitems[i][0]]=[bonitems[i][1],bonitems[i][2],descripcion_acomodada,cantidad_regalo,"UND",bonitems[i][4],0.00,0.00,0.00];
        // items_validos2[bonitems[i][0]]=[bonitems[i][1],bonitems[i][2],descripcion_acomodada,cantidad_regalo,"UND",bonitems[i][4],0.00,0.00,0.00];
        
        // bon_arreglado[bonitems[i][0]]=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],"D","D","S",numero_item,bonitems[i][0],bonitems[i][1],bonitems[i][2],"UND",descripcion_acomodada,cantidad_regalo,0.00,0.00,0.00,0.00,'01',bonitems[i][4],"S",1,"UND",""];
        items_validos2[bonitems[i][0]]=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],"D","D",aigv,numero_item,bonitems[i][0],bonitems[i][1],bonitems[i][2],"UND",descripcion_acomodada,cantidad_regalo,0.00,0.00,0.00,0.00,'01',bonitems[i][4],"S",1,"UND",""];
        numero_item++;
    }
    console.log("este es el objeto final final todo preparado")
    console.log(items_validos2)
    // res.status(200).json(bon_arreglado);
    res.status(200).json({items_validos2});

}

module.exports={analisarprom}