let bonificacion_aplicada_conjunto=(res,nprom,cotdetalle,promcabesa,promdetalle,tipometrica)=>{
    console.log(tipometrica);
    let comodin_bon="GRATIS/PROM:(P#";
    let descripcion_acomodada="";
    // let comodin_dsc_cabesera=comodin_dsc+promcabesa[1];
    let agrupado1=[];
    let agrupado2={};

    let items_validos2={};
    let und_a_llegar=0;
    let unidades_acumuladas=0;
    let item_regalo="";
    let total_regalo=0;
    for(let x in cotdetalle){
        for(let y in promdetalle){
            if(promdetalle[y][0]==cotdetalle[x][9]){
                let diferenciar_bonificacion=cotdetalle[x][13].substring(0,11);
                if(diferenciar_bonificacion!="GRATIS/PROM"){
                    /////////SOLO TESTEO PARA VER EL TIPO DE METRICA
                    if(tipometrica=='1'){
                        // items_validos2[cotdetalle[x][9]]=[cotdetalle[x][5],promdetalle[y][1],promdetalle[y][3]];
                        items_validos2[cotdetalle[x][9]]=[cotdetalle[x][18],promdetalle[y][1],promdetalle[y][3]];
                    }
                    else if(tipometrica=='2'){
                        // items_validos2[cotdetalle[x][9]]=[cotdetalle[x][3],promdetalle[y][1],promdetalle[y][3]];
                        items_validos2[cotdetalle[x][9]]=[cotdetalle[x][14],promdetalle[y][1],promdetalle[y][3]];
                    }
                    //////////////////////////////
                    // items_validos2[cotdetalle[x][0]]=[cotdetalle[x][3],promdetalle[y][1],promdetalle[y][3]];
                }
            }
        }
    }
    console.log("dentro de la funcion");    

    for(let i in items_validos2){
        unidades_acumuladas+=items_validos2[i][0];
        und_a_llegar=items_validos2[i][1];
        item_regalo=items_validos2[i][2];
    }
    if(unidades_acumuladas>=und_a_llegar){
        let division=unidades_acumuladas/und_a_llegar;
        total_regalo=Math.floor(division);
        // venta_total_calculado=(cantidad_promocion*primer_monto).toFixed(2);
    }

    console.log("resultado final promo tipo 331")
    console.log(items_validos2)//////hasta si es valido
    console.log("resultado de cuantas unidades tengo q regalar")
    console.log(total_regalo)
    // console.log("resultado final de cual es el regalo a dar")
    // console.log(item_regalo)

    // return items_validos2;
    return [items_validos2,total_regalo];
}

module.exports=bonificacion_aplicada_conjunto;