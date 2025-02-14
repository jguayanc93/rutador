const {config,Connection,Request,TYPES} = require('../../conexion/cadena')

function bonificacion(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,arr){
// function bonificacion(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,items_validos,items_validos2,items_promos2){
    ////crear una busqueda correspondiente para ver cuales son sus respectivos items de descuentos
    ////porqe podria tener uno diferente a si mismo o podria tener 2 o mas items de regalo
    let contador=0;
    let objeto_promociones={};
    let tamaño;
    let items_validos;
    let items_validos2;
    let items_promos2;
    let contador_item;
    if(tipopromo[0]==1){
        items_validos2=arr[0];
        items_promos2=arr[1];
        contador_item=Object.keys(items_validos2).length+1;
    }
    else{
        items_validos=arr[0];
        items_validos2=arr[1];
        items_promos2=arr[2];
        contador_item=items_validos[6];
    }
    //////CORREGIR ESTO PARA Q EL TAMAÑO SEA DE ACUERDO ALA CANTIDAD DE ITEMS ACEPTADOS
    // tipopromo[0]==1 ? tamaño=Object.keys(items_validos2) : tamaño=Object.keys(items_validos2);
    tipopromo[0]==1 ? tamaño=Object.keys(items_validos2) : tamaño=Object.keys(items_validos2);
    // let contador_item=tamaño.length;
    // let contador_item=items_validos[6];
    // bd_conexion(res,tipopromo,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones);
    bd_conexion(res,tipopromo,items_validos,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones);
}
let bd_conexion=(res,tipopromo,items_validos,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
// let bd_conexion=(res,tipopromo,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        // else{ bucle_bonificacion(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones); }
        else{
            if(tipopromo[0]==1){bucle_bonificacion(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones);}
            else{
                // bucle_bonificacion2(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones);
                // intervalo_bonificacion_totalisada(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones);
                intervalo_bonificacion_totalisada(res,items_validos,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones);
            }
        }
    });
}
let bucle_bonificacion=(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
    if(tamaño.length<=contador){
        conexion.close();
        let solo_valores=Object.values(objeto_promociones);
        let valores_separados=[];
        let valores_finales={};
        console.log(solo_valores);
        for(let x in solo_valores){
            for(let y in solo_valores[x]){
                // console.log(solo_valores[x][y])
                valores_separados.push(solo_valores[x][y])
            }
            // valores_separados.push(solo_valores[x])
        }
        console.log("objeto final con los items verdaderamente separados");
        console.log(valores_separados);
        Object.assign(valores_finales,valores_separados);
        ///para el final
        res.status(200).json(valores_finales)
    }
    else{
        console.log("esto es el tamaño")
        console.log(tamaño)
        console.log("y este es el objeto de items validos")
        console.log(items_validos2)
        console.log("y este es el objeto de promociones")
        console.log(items_promos2)
        let comodin_bon="GRATIS/PROM:(P#";
        let descripcion_acomodada="";
        let sp_sql="select b.codi,b.codf,b.marc,b.descr,b.pcus,b.msto,b.aigv from dtl_promocion_bonitem a join prd0101 b on b.codf=a.boncodf where a.idprom=@nprom and a.codi=@codi order by a.positem";
        let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
            if(err){ console.log(err); }
            else{
                if(rows.length==0){bucle_bonificacion(res,items_validos2,items_promos2,tamaño,contador+1,contador_item,objeto_promociones)}
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
                    console.log("este el resultado de la consulta")
                    console.log(respuesta)
                    objeto_promociones[tamaño[contador]]=[];
                    for(let item in respuesta){
                        // let comodin_completo=comodin_bon+items_promos2[tamaño][6].toString()+")"+respuesta[item][3];
                        let comodin_completo=comodin_bon+items_promos2[tamaño[contador]][6].toString()+")"+respuesta[item][3];
                        if(comodin_completo.length>80){
                            descripcion_acomodada=comodin_completo.substring(0,75);
                            descripcion_acomodada=descripcion_acomodada+"(BON)";
                        }
                        else{
                            if(comodin_completo.length>75){
                                descripcion_acomodada=comodin_completo.substring(0,75);
                                descripcion_acomodada=descripcion_acomodada+"(BON)";
                            }else{ descripcion_acomodada=comodin_completo+"(BON)"; }
                        }
                        /////TERMINAR LA CADENA COMPLETA DE LA BONIFICACION
                        // objeto_promociones[tamaño[contador]]=[items_validos2[tamaño[contador]][2],descripcion_acomodada];
                        // objeto_promociones[tamaño[contador]].push([items_validos2[tamaño[contador]][2],respuesta[item][0],descripcion_acomodada])
                        // objeto_promociones[tamaño[contador]].push([items_validos2[tamaño[contador]][0],items_validos2[tamaño[contador]][1],items_validos2[tamaño[contador]][2],items_validos2[tamaño[contador]][3],items_validos2[tamaño[contador]][4],items_validos2[tamaño[contador]][5],contador_item+1,items_validos2[tamaño[contador]][7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,items_validos2[tamaño[contador]][7],0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""])
                        objeto_promociones[tamaño[contador]].push([items_validos2[tamaño[contador]][0],items_validos2[tamaño[contador]][1],items_validos2[tamaño[contador]][2],items_validos2[tamaño[contador]][3],items_validos2[tamaño[contador]][4],items_validos2[tamaño[contador]][5],contador_item+1,items_validos2[tamaño[contador]][7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""])
                        contador_item++;
                    }
                    bucle_bonificacion(res,items_validos2,items_promos2,tamaño,contador+1,contador_item,objeto_promociones)
                }
            }
        })
        // el error es porqe en el objeto de items_promos2 no existe tal index por eso te bota el error
        consulta.addParameter('nprom',TYPES.VarChar,items_promos2[tamaño[contador]][6].toString());
        consulta.addParameter('codi',TYPES.VarChar,items_promos2[tamaño[contador]][0]);
        conexion.execSql(consulta);
    }
}
let intervalo_bonificacion_totalisada=(res,items_validos,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
// let intervalo_bonificacion_totalisada=(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
    let nuevo_items_promos2={};
    for(let item in items_promos2) nuevo_items_promos2[items_promos2[item][0]]=items_promos2[item];
    // bucle_bonificacion2(res,items_validos2,nuevo_items_promos2,tamaño,contador,contador_item,objeto_promociones)
    bucle_bonificacion2(res,items_validos,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)
}
let bucle_bonificacion2=(res,items_validos,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
// let bucle_bonificacion2=(res,items_validos2,items_promos2,tamaño,contador,contador_item,objeto_promociones)=>{
    if(tamaño.length<=contador){
        conexion.close();
        let solo_valores=Object.values(objeto_promociones);
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
                if(rows.length==0){bucle_bonificacion2(res,items_validos,items_validos2,items_promos2,tamaño,contador+1,contador_item+1,objeto_promociones)}
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
                        // let comodin_completo=comodin_bon+items_promos2[tamaño][6].toString()+")"+respuesta[item][3];
                        // let comodin_completo=comodin_bon+items_promos2[tamaño[contador]][6].toString()+")"+respuesta[item][3];
                        let comodin_completo=comodin_bon+items_validos2[tamaño[contador]][6].toString()+")"+respuesta[item][3];
                        if(comodin_completo.length>80){
                            descripcion_acomodada=comodin_completo.substring(0,75);
                            descripcion_acomodada=descripcion_acomodada+"(BON)";
                        }
                        else{
                            if(comodin_completo.length>75){
                                descripcion_acomodada=comodin_completo.substring(0,75);
                                descripcion_acomodada=descripcion_acomodada+"(BON)";
                            }else{ descripcion_acomodada=comodin_completo+"(BON)"; }
                        }
                        /////TERMINAR LA CADENA COMPLETA DE LA BONIFICACION
                        // objeto_promociones[tamaño[contador]]=[items_validos2[tamaño[contador]][2],descripcion_acomodada];
                        // objeto_promociones[tamaño[contador]]=[items_validos2[2],descripcion_acomodada];
                        console.log("cuanto es la cantidad de tamaño q tengo aora")
                        console.log(contador_item)
                        
                        if(Object.keys(objeto_promociones).includes(respuesta[item][0])){
                            ///si existe el codi debo de aumentar la cantidad de unidades a regalar de este item
                            // objeto_promociones[respuesta[item][0]][6]+=1;
                            // objeto_promociones[respuesta[item][0]][6]=contador_item;
                        }
                        else{
                            console.log("revisar esta salida de cantidades para la respuesta final")
                            console.log(items_validos[7]);
                            if(items_validos[7]==0){}
                            else{
                                objeto_promociones[respuesta[item][0]]=[items_validos[0],items_validos[1],items_validos[2],items_validos[3],items_validos[4],items_validos[5],contador_item,items_validos[7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""];
                            }
                            // objeto_promociones[respuesta[item][0]]=[items_validos2[0],items_validos2[1],items_validos2[2],items_validos2[3],items_validos2[4],items_validos2[5],contador_item,items_validos2[7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""];

                            // objeto_promociones[respuesta[item][0]]=[items_validos[0],items_validos[1],items_validos[2],items_validos[3],items_validos[4],items_validos[5],contador_item,items_validos[7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""];
                        }
                        contador_item++;
                        // objeto_promociones[tamaño[contador]].push([items_validos2[tamaño[contador]][2],respuesta[item][0],descripcion_acomodada])
                        // objeto_promociones[tamaño[contador]].push([items_validos2[tamaño[contador]][0],items_validos2[tamaño[contador]][1],items_validos2[tamaño[contador]][2],items_validos2[tamaño[contador]][3],items_validos2[tamaño[contador]][4],items_validos2[tamaño[contador]][5],contador_item+1,items_validos2[tamaño[contador]][7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,items_validos2[tamaño[contador]][7],0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""])
                        // objeto_promociones[tamaño[contador]].push([items_validos2[tamaño[contador]][0],items_validos2[tamaño[contador]][1],items_validos2[tamaño[contador]][2],items_validos2[tamaño[contador]][3],items_validos2[tamaño[contador]][4],items_validos2[tamaño[contador]][5],contador_item+1,items_validos2[tamaño[contador]][7],"D","D",respuesta[item][6],respuesta[item][0],respuesta[item][1],respuesta[item][2],"UND",descripcion_acomodada,0,0,0,0,'01',respuesta[item][4],"S",1,"UND",""])
                        
                    }
                    bucle_bonificacion2(res,items_validos,items_validos2,items_promos2,tamaño,contador+1,contador_item+1,objeto_promociones)
                }
            }
        })
        // el error es porqe en el objeto de items_promos2 no existe tal index por eso te bota el error
        // consulta.addParameter('nprom',TYPES.VarChar,items_promos2[tamaño[contador]][6].toString());
        consulta.addParameter('nprom',TYPES.VarChar,items_validos2[tamaño[contador]][6].toString());
        // consulta.addParameter('codi',TYPES.VarChar,items_promos2[tamaño[contador]][0]);
        consulta.addParameter('codi',TYPES.VarChar,items_validos2[tamaño[contador]][0]);
        conexion.execSql(consulta);
    }
}

module.exports=bonificacion;