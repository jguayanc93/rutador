////////METRICA EN UNIDADES
let dsct_aplicado_conjunto=(res,nprom,cotdetalle,promcabesa,promdetalle)=>{
    ///////////FALTA LOS TOTALISADOS PARA LA CABESERA
    let cabesera={};
    let numero_documento="";
    let cabesatota=0;
    let cabesatotn=0;
    //////FALTA UN FOR PARA SABER EN Q NUMERO DE ITEM SE ENCUENTRA
    let numero_item=1;
    for(let i in cotdetalle){ numero_item++; }

    let comodin_dsc='DSCTO/PROM: ';
    let comodin_dsc_cabesera=comodin_dsc+promcabesa[1];
    let agrupado1=[];
    let agrupado2={};

    let items_validos={};
    let items_validos2={};
    let und_a_llegar=0;
    let unidades_acumuladas=0;
    let primer_monto=0;
    let venta_total_calculado=0;
    let venta_total_sin_igv=0;
    for(let x in cotdetalle){
        numero_documento=cotdetalle[x][2]
        cabesatota+=parseFloat(cotdetalle[x][16]);
        cabesatotn+=parseFloat(cotdetalle[x][18]);
        for(let y in promdetalle){
            if(promdetalle[y][0]==cotdetalle[x][9]){
                let diferenciar_bonificacion=cotdetalle[x][13].substring(0,11);
                if(diferenciar_bonificacion!="GRATIS/PROM"){
                    let monto_inicial=promdetalle[y][1]*promdetalle[y][2];
                    // items_validos2[cotdetalle[x][0]]=[cotdetalle[x][3],promdetalle[y][2],cantidad_recibir];
                    items_validos[cotdetalle[x][9]]=[cotdetalle[x][14],promdetalle[y][1],promdetalle[y][2],monto_inicial];
                }
            }
        }
    }
    for(let i in items_validos){
        primer_monto=items_validos[i][3];
        und_a_llegar=items_validos[i][1];
        unidades_acumuladas+=items_validos[i][0];        
    }
    if(unidades_acumuladas>=und_a_llegar){
        let division=unidades_acumuladas/und_a_llegar;
        let cantidad_promocion=Math.floor(division)*-1;
        venta_total_calculado=(cantidad_promocion*primer_monto).toFixed(2);
        venta_total_sin_igv=(venta_total_calculado/1.18).toFixed(2);
        ///////cuidado con los nuevos montos
        cabesatota+=parseFloat(venta_total_sin_igv);
        cabesatotn+=parseFloat(venta_total_calculado);
    }
    // agrupado1=["DS00","",comodin_dsc_cabesera,1,"",venta_total_sin_igv,0.00,venta_total_sin_igv,venta_total_calculado];
    agrupado1=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],"D","D","S",numero_item,"0303-010001","DS00","","",comodin_dsc_cabesera,1,venta_total_sin_igv,venta_total_sin_igv,0.00,venta_total_calculado,'01',0,"N",1,"",""];
    items_validos2["0303-010001"]=agrupado1;
    cabesera["descuento"]=[numero_documento,cabesatota,(cabesatota*0.18).toFixed(2),cabesatotn];

    console.log("resultado final promo tipo 311")
    console.log(items_validos2)
    console.log("resultado de cuantas unidades e sumado")
    console.log(unidades_acumuladas)
    console.log("resultado final de sumatoria de descuento total")
    console.log(venta_total_calculado)

    console.log("este es el nuevo resultado del tipo 311")
    console.log(agrupado1)

    res.status(200).json({items_validos2,cabesera});
}


module.exports=dsct_aplicado_conjunto;