require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

//let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let agrupador = (res,cotdetalle,ngrupo) =>{
    // let {ncoti,nprom} = req.body;
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,nprom,next) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,cotdetalle,ngrupo) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,cotdetalle,ngrupo)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,cotdetalle,ngrupo); }
    });
}

let bd_consulta = (res,cotdetalle,ngrupo)=>{
    let sp_sql="select idprom,idagrupa,prioagrupa from mst_promocion where estado=1 and idagrupa=@ngrupo";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ 
            // res.status(401).send("error interno");
            console.log(err);
         }
        else{
            // conexion.close();
            if(rows.length==0) res.status(401).send("no promo");
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
                console.log(respuesta);
                console.log("termine una tabla de grupo")
                console.log(respuesta2);
                console.log(cotdetalle);
                let sumador=0;
                let codis_anonimo=[];
                for(const indice of Object.values(cotdetalle)){
                    codis_anonimo.push(indice[9])
                    sumador+=indice[18];
                }
                // console.log(sumador);
                // console.log(codis_anonimo);
                let cadena="(";
                for(const prom of respuesta){                    
                    cadena+="'"+prom[0]+"'"+",";
                }
                let cadena_completa=cadena.substring(0,cadena.length-1);                
                cadena_completa=cadena_completa+")";
                console.log(cadena_completa)
                prom_repetida(res,cotdetalle,sumador,codis_anonimo,cadena_completa,ngrupo)
            }
        }
    })
    consulta.addParameter('ngrupo',TYPES.Int,ngrupo);
    conexion.execSql(consulta);
}

let prom_repetida=(res,cotdetalle,sumador,codis_anonimo,cadena_completa,ngrupo)=>{
    // let sp_sql="select idprom,monto,boncodf from dtl_promocion_progra where codi=@codi and idprom in @cadena";
    let sp_sql="select idprom,monto,boncodf from dtl_promocion_progra where codi=@codi and idprom in"+cadena_completa;
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){
            // res.status(401).send("error interno");
            console.log(err)
        }
        else{
            // conexion.close();
            if(rows.length==0) res.status(401).send("no promo");
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
                contador=0;////reasignacion de la variable a 0
                // Object.assign(respuesta2,respuesta);
                console.log(respuesta);
                console.log("tabla de montos contra montos")
                // console.log(respuesta2);
                // respuesta.sort((a,b)=>{return b[1] - a[1]});
                respuesta.sort((a,b)=>b[1] - a[1]);
                // console.log("array sorteado")
                // console.log(respuesta);
                // console.log("monto de sumador contra mejor monto")
                // console.log(sumador);
                console.log("cotizacion")
                console.log(cotdetalle);
                //let residuo=[];
                let regalos_medidos={}
                respuesta.forEach((promocion)=>{
                    if(Math.floor(sumador/promocion[1])>0){
                        let cantidad_correspondiente=Math.floor(sumador/promocion[1]);
                        // regalos_medidos[promocion[0]]=[promocion[1],cantidad_correspondiente,promocion[2]];
                        // regalos_medidos[promocion[0]]=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],promocion[0],2,cantidad_correspondiente,"D","D",promocion[1],promocion[2]];
                        regalos_medidos[contador]=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],promocion[0],2,cantidad_correspondiente,"D","D",promocion[1],promocion[2]];
                        //residuo.push(Math.floor(sumador/promocion[1]));
                        sumador=sumador-(Math.floor(sumador/promocion[1])*promocion[1]);
                        // console.log("residuo",sumador-(Math.floor(sumador/promocion[1])*promocion[1]));
                        console.log("residuo",sumador);
                        contador++;
                    }
                })
                console.log("sumador",sumador);
                ///////correr para crear tantos vales como el objeto de abajo
                console.log(regalos_medidos);
                intervalo_regalos_obtenidos(res,codis_anonimo[0],regalos_medidos,ngrupo);
            }
        }
    })
    consulta.addParameter('codi',TYPES.VarChar,codis_anonimo[0]);
    // consulta.addParameter('cadena',TYPES.VarChar,cadena_completa);
    conexion.execSql(consulta);
}

let intervalo_regalos_obtenidos=(res,codi_anonimo,regalos_medidos,ngrupo)=>{
    let nuevo_items_promos2={};
    let tamaño=Object.values(regalos_medidos).length;
    let contador=0;
    // for(let item in regalos_medidos) nuevo_items_promos2[items_promos2[item][0]]=items_promos2[item];
    bucle_bonificacion2(res,codi_anonimo,regalos_medidos,tamaño,contador,nuevo_items_promos2,ngrupo);
}

let bucle_bonificacion2=(res,codi_anonimo,regalos_medidos,tamaño,contador,objeto_promociones,ngrupo)=>{
    if(tamaño<=contador){
        conexion.close();
        let solo_valores=Object.values(objeto_promociones);
        // console.log("termine la pila de la mejor promocion");
        // console.log(objeto_promociones)
        objeto_promociones["agrupados"]=ngrupo;
        //////no te olvides derivar a una funcion q discrime a las cantidades en 0
        res.status(200).json(objeto_promociones)
    }
    else{
        let comodin_bon="GRATIS/PROM:(P#";
        let descripcion_acomodada="";
        let sp_sql="select b.codi,b.codf,b.marc,b.descr,b.pcus,b.msto,b.aigv from dtl_promocion_bonitem a join prd0101 b on b.codf=a.boncodf where a.idprom=@nprom and a.codi=@codi order by a.positem";
        let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            else{
                if(rows.length==0){bucle_bonificacion2(res,codi_anonimo,regalos_medidos,tamaño,contador+1,objeto_promociones,ngrupo)}
                else{
                    let respuesta=[];
                    let respuesta2={};
                    let contador_interno=0;
                    rows.forEach(fila=>{
                        let tmp={};
                        fila.map(data=>{
                            if(contador_interno>=fila.length) contador_interno=0;
                            typeof data.value=='string' ? tmp[contador_interno]=data.value.trim() : tmp[contador_interno]=data.value;
                            contador_interno++;
                        })
                        respuesta.push(tmp);
                    });
                    Object.assign(respuesta2,respuesta);
                    for(let item in respuesta){
                        let comodin_completo=comodin_bon+regalos_medidos[contador][5]+")"+respuesta[item][3];
                        if(comodin_completo.length>80){
                            descripcion_acomodada=comodin_completo.substring(0,75);
                            descripcion_acomodada=descripcion_acomodada+"(BON)";
                        }
                        else{
                            if(comodin_completo.length>75){
                                descripcion_acomodada=comodin_completo.substring(0,75);
                                descripcion_acomodada=descripcion_acomodada+"(BON)";
                            }
                            else{ descripcion_acomodada=comodin_completo+"(BON)"; }
                        }
                        // console.log("cuanto es la cantidad de tamaño q tengo aora")
                        // console.log(contador_item)
                        
                        if(Object.keys(objeto_promociones).includes(respuesta[item][0])){
                            ///si existe el codi debo de aumentar la cantidad de unidades a regalar de este item
                        }
                        else{
                            // console.log("revisar esta salida de cantidades para la respuesta final")
                            // console.log(items_validos[7]);
                            // if(items_validos[7]==0){}
                            // else{
                            //     objeto_promociones[respuesta[item][0]]=[items_validos[0],items_validos[1],items_validos[2],items_validos[3],items_validos[4],items_validos[5],contador_item,items_validos[7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""];
                            // }
                            objeto_promociones[respuesta[item][0]]=[regalos_medidos[contador][0],regalos_medidos[contador][1],regalos_medidos[contador][2],regalos_medidos[contador][3],regalos_medidos[contador][4],regalos_medidos[contador][5],2,regalos_medidos[contador][7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""];
                        }
                        // contador_item++;
                    }
                    bucle_bonificacion2(res,codi_anonimo,regalos_medidos,tamaño,contador+1,objeto_promociones,ngrupo)
                }
            }
        })
        consulta.addParameter('nprom',TYPES.Int,regalos_medidos[contador][5]);
        consulta.addParameter('codi',TYPES.VarChar,codi_anonimo);
        conexion.execSql(consulta);
    }
}

module.exports={agrupador}