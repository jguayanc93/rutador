let dsct_aplicado=(res,nprom,cotdetalle,promcabesa,promdetalle)=>{
    ///////////FALTA LOS TOTALISADOS PARA LA CABESERA
    let cabesera={};
    let numero_documento="";
    let cabesatota=0;
    let cabesatotn=0;
    //////FALTA UN FOR PARA SABER EN Q NUMERO DE ITEM SE ENCUENTRA
    let numero_item=1;
    for(let i in cotdetalle){ numero_item++; }

    let comodin_dsc='DSCTO/PROM: ';
    let descripcion_acomodada="";
    let comodin_dsc_cabesera=comodin_dsc+promcabesa[1]+"/";
    let items_validos2={};
    
    for(let x in cotdetalle){
        numero_documento=cotdetalle[x][2]
        cabesatota+=parseFloat(cotdetalle[x][16]);
        cabesatotn+=parseFloat(cotdetalle[x][18]);
        for(let y in promdetalle){
            if(promdetalle[y][0]==cotdetalle[x][9]){
                let check_monto_prom=promdetalle[y][1];
                let check_monto_item=cotdetalle[x][14];
                let diferenciar_bonificacion=cotdetalle[x][13].substring(0,11);
                if(check_monto_item>=check_monto_prom && diferenciar_bonificacion!="GRATIS/PROM"){
                    let division=check_monto_item/check_monto_prom;
                    // let cantidad_promocion=Math.floor(division);////////ojo con la conversion a negativo
                    let cantidad_promocion=Math.floor(division)*-1;
                    let cantidad_recibir=cantidad_promocion*promdetalle[y][2];
                    let cantidad_recibir_sin_igv=(cantidad_recibir/1.18).toFixed(2);

                    let comodin_completo=comodin_dsc_cabesera+cotdetalle[x][13];
                    comodin_completo.length>80 ? descripcion_acomodada=comodin_completo.substring(0,80) : descripcion_acomodada=comodin_completo;
                    // items_validos2[cotdetalle[x][0]]=[cotdetalle[x][3],promdetalle[y][2],cantidad_recibir];///ORIGINAL
                    // items_validos2[cotdetalle[x][9]]=["DS00","",descripcion_acomodada,1,"",cantidad_recibir_sin_igv,0.00,cantidad_recibir_sin_igv,cantidad_recibir];
                    items_validos2[cotdetalle[x][9]]=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],"D","D","S",numero_item,"0303-010001","DS00","","",descripcion_acomodada,1,cantidad_recibir_sin_igv,cantidad_recibir_sin_igv,0.00,cantidad_recibir,'01',0,"N",1,"",""];
                    numero_item++;
                }
            }
        }
    }
    
    for(let y in items_validos2){
        cabesatota+=parseFloat(items_validos2[y][16]);
        cabesatotn+=parseFloat(items_validos2[y][18]);
    }

    // items_validos2["cabesera"]=[numero_documento,cabesatota,cabesatotn];
    // cabesera["descuento"]=[numero_documento,cabesatota,cabesatotn];
    cabesera["descuento"]=[numero_documento,cabesatota,(cabesatota*0.18).toFixed(2),cabesatotn];

    console.log("resultado final promo tipo 113")
    console.log(items_validos2);

    // res.status(200).json(items_validos2)/////valido
    res.status(200).json({items_validos2,cabesera})
}

module.exports=dsct_aplicado;