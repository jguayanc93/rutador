let bonificacion_aplicada=(res,nprom,cotdetalle,promcabesa,promdetalle)=>{
    //////FALTA UN FOR PARA SABER EN Q NUMERO DE ITEM SE ENCUENTRA
    let numero_item=1;
    for(let i in cotdetalle){ numero_item++; }
    // let comodin_dsc='GRATIS/PROM:(P#10518MEMORIA USB 64GB HP V222W (HPF(BON)';
    let comodin_bon="GRATIS/PROM:(P#";
    let descripcion_acomodada="";
    let items_validos2={};
    // for(let x in cotdetalle){
    //     for(let y in promdetalle){
    //         if(promdetalle[y][0]==cotdetalle[x][0]){
    //             let check_monto_prom=promdetalle[y][1];
    //             let check_monto_item=cotdetalle[x][3];
    //             let diferenciar_bonificacion=cotdetalle[x][2].substring(0,11);
    //             if(check_monto_item>=check_monto_prom && diferenciar_bonificacion!="GRATIS/PROM"){
    //                 let division=check_monto_item/check_monto_prom;
    //                 let cantidad_promocion=Math.floor(division);
    //                 let cantidad_recibir=cantidad_promocion*promdetalle[y][2];
                    
    //                 let comodin_completo=comodin_bon+promcabesa[0]+")"+cotdetalle[x][2];
    //                 if(comodin_completo.length>80){
    //                     descripcion_acomodada=comodin_completo.substring(0,75);
    //                     descripcion_acomodada=descripcion_acomodada+"(BON)";
    //                 }
    //                 else{
    //                     if(comodin_completo.length>75){
    //                         descripcion_acomodada=comodin_completo.substring(0,75);
    //                         descripcion_acomodada=descripcion_acomodada+"(BON)";
    //                     }
    //                     else{ descripcion_acomodada=comodin_completo+"(BON)"; }
    //                 }
    //                 // items_validos2[cotdetalle[x][0]]=[cotdetalle[x][3],promdetalle[y][3],cantidad_recibir];
    //                 items_validos2[cotdetalle[x][0]]=[promdetalle[x][3],promdetalle[y][5],descripcion_acomodada,cantidad_recibir,"UND","Gratis",0.00,0.00,0.00];
    //                 // items_validos2[cotdetalle[x][0]]=["DS00","",descripcion_acomodada,1,"",cantidad_recibir_sin_igv,0.00,cantidad_recibir_sin_igv,cantidad_recibir];
    //             }
    //         }
    //     }
    // }
    for(let x in cotdetalle){
        for(let y in promdetalle){
            if(promdetalle[y][0]==cotdetalle[x][9]){
                let check_monto_prom=promdetalle[y][1];
                let check_monto_item=cotdetalle[x][14];
                let diferenciar_bonificacion=cotdetalle[x][13].substring(0,11);
                if(check_monto_item>=check_monto_prom && diferenciar_bonificacion!="GRATIS/PROM"){
                    let division=check_monto_item/check_monto_prom;
                    let cantidad_promocion=Math.floor(division);
                    let cantidad_recibir=cantidad_promocion*promdetalle[y][2];
                    
                    let comodin_completo=comodin_bon+promcabesa[0]+")"+cotdetalle[x][13];
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
                    // items_validos2[cotdetalle[x][0]]=[cotdetalle[x][3],promdetalle[y][3],cantidad_recibir];
                    // items_validos2[cotdetalle[x][0]]=[promdetalle[x][3],promdetalle[y][5],descripcion_acomodada,cantidad_recibir,"UND","Gratis",0.00,0.00,0.00];
                    items_validos2[cotdetalle[x][9]]=[cotdetalle[0][0],cotdetalle[0][1],cotdetalle[0][2],cotdetalle[0][3],cotdetalle[0][4],"D","D","S",numero_item,promdetalle[y][6],promdetalle[y][3],promdetalle[y][5],"UND",descripcion_acomodada,cantidad_recibir,0.00,0.00,0.00,0.00,'01',promdetalle[y][7],"S",1,"UND",""];
                }
            }
        }
    }
    console.log("resultado final promo tipo 131")
    console.log(items_validos2)
    // res.status(200).json(items_validos2)
    res.status(200).json({items_validos2})
}

module.exports=bonificacion_aplicada;