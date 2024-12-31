function m_valorizado_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,numero_item){
    ///////////SOLO PARA LOS TOTALISADOS DE LA CABESERA
    let numero_documento;
    let cabesatota=0;
    let cabesatotn=0;
    ////////////////////////////////
    let n_item=numero_item+1;
    let items_validos=[];
    let items_validos2={};
    let items_promos2=[];
    for(let x in cotdetalle){
        numero_documento=cotdetalle[x][2];
        cabesatota+=parseFloat(cotdetalle[x][16]);
        cabesatotn+=parseFloat(cotdetalle[x][18]);
        for(let y in promdetalle){
            if(promdetalle[y][0]==cotdetalle[x][9]){
                let diferenciar_bonificacion=cotdetalle[x][13].substring(0,11);
                if(diferenciar_bonificacion!="GRATIS/PROM"){
                    items_validos2[cotdetalle[x][9]]=[promdetalle[y][0],promdetalle[y][1],promdetalle[y][2],promdetalle[y][3],promdetalle[y][4],promdetalle[y][5],promdetalle[y][6],promdetalle[y][7]];
                    items_validos.push([cotdetalle[x][0],cotdetalle[x][1],cotdetalle[x][2],cotdetalle[x][3],cotdetalle[x][4],cotdetalle[x][9],cotdetalle[x][18]]);
                    items_promos2.push([promdetalle[y][0],promdetalle[y][1],promdetalle[y][2],promdetalle[y][3],promdetalle[y][4],promdetalle[y][5],promdetalle[y][6],promdetalle[y][7]]);
                }
            }
        }
    }
    let retorno_conjunto=suma_cantidades(items_validos,items_promos2,n_item,promcabesa);
    return [retorno_conjunto,items_validos2,items_promos2,numero_documento,cabesatota,cabesatotn];
}
function suma_cantidades(items_validos,items_promos2,n_item,promcabesa){
    ///recontruir esto para calcular segun el monto no las unidades
    let contador=0;
    let unidades_minimas=0;
    for(let item in items_validos) contador+=items_validos[item][6];
    for(let iprom in items_promos2) unidades_minimas=items_promos2[iprom][1];
    ///////REVIVIR EN CASO DE SER NECESITADO EMERGENCIA
    let division=contador/unidades_minimas;
    let cantidad_promocion=Math.floor(division);
    ///////APLICANDO LA DISPONIBILIDAD MAXIMA DE UNIDADES POR PROMOCION
    console.log("ESTE VALOR DEBE SER TESTEADO ANTES DE COMPARARLO")
    console.log(promcabesa[7]);
    if(promcabesa[7]!=0){
        if(promcabesa[7]<=cantidad_promocion){
            return [items_validos[0][0],items_validos[0][1],items_validos[0][2],items_validos[0][3],items_validos[0][4],"item nombre",n_item,promcabesa[7]];
        }
        else{return [items_validos[0][0],items_validos[0][1],items_validos[0][2],items_validos[0][3],items_validos[0][4],"item nombre",n_item,cantidad_promocion];}
    }
    else{
        return [items_validos[0][0],items_validos[0][1],items_validos[0][2],items_validos[0][3],items_validos[0][4],"item nombre",n_item,cantidad_promocion];
    }
    /////HASTA AQUI
    // return [items_validos[0][0],items_validos[0][1],items_validos[0][2],items_validos[0][3],items_validos[0][4],"item nombre",n_item,cantidad_promocion];
}


module.exports=m_valorizado_conjunto;