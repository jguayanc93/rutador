
// function descuento(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,items_validos2,items_promos2){
//     let comodin_dsc='DSCTO/PROM: ';
//     let descripcion_acomodada="";
//     let comodin_dsc_cabesera=comodin_dsc+promcabesa[1]+"/";
//     for(let i in items_validos2){
//         ////////ERROR EN ESTA LINEA PARA EL TOTALISADO DE UN DESCUENTO
//         let cantidad_recibir=items_validos2[i][7]*items_promos2[i][2]*-1;
//         let cantidad_recibir_sin_igv=(cantidad_recibir/1.18).toFixed(2);
//         let comodin_completo=comodin_dsc_cabesera+items_validos2[i][5];
//         comodin_completo.length>80 ? descripcion_acomodada=comodin_completo.substring(0,80) : descripcion_acomodada=comodin_completo;
//         // items_validos2[i].push("D","D","S","0303-010001","DS00","","",descripcion_acomodada,1,cantidad_recibir_sin_igv,cantidad_recibir_sin_igv,0.00,cantidad_recibir,'01',0,"N",1,"","")
//         items_validos2[i].push("D","D","S","0303-010001","DS00","","",descripcion_acomodada,cantidad_recibir_sin_igv,cantidad_recibir_sin_igv,0.00,cantidad_recibir,'01',0,"N",1,"UND","")
//         //////////////////mone,moneitem,aigv,codi,codf,marc,umed,descripcion acomodada,preciounitario,tota,descuento,totn,codalm,costo,msto,ucon,ucom,obse
//     }
//     // return items_validos2;
//     res.status(200).json(items_validos2)
// }
// function descuento(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,items_validos,items_validos2,items_promos2,numero_documento,cabesatota,cabesatotn){
function descuento(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,arr){
    
    let items_validos2;
    let items_promos2;
    let numero_documento;
    let cabesatota;
    let cabesatotn;
    if(tipopromo[0]==1){
        items_validos2=arr[0];
        items_promos2=arr[1];
        numero_documento=arr[2];
        cabesatota=arr[3];
        cabesatotn=arr[4];
    }
    else{
        items_validos2=arr[0];
        items_promos2=arr[2];
        numero_documento=arr[3];
        cabesatota=arr[4];
        cabesatotn=arr[5];
    }

    let comodin_dsc='DSCTO/PROM: ';
    let descripcion_acomodada="";
    console.log("el objeto final con cabesera itemvalidos2")
    console.log(items_validos2)

    if(tipopromo[0]==1){
        let comodin_dsc_cabesera=comodin_dsc+promcabesa[1]+"/";
        for(let i in items_validos2){
            let cantidad_recibir=items_validos2[i][7]*items_promos2[i][2]*-1;
            let cantidad_recibir_sin_igv=(cantidad_recibir/1.18).toFixed(2);
            let comodin_completo=comodin_dsc_cabesera+items_validos2[i][5];
            comodin_completo.length>80 ? descripcion_acomodada=comodin_completo.substring(0,80) : descripcion_acomodada=comodin_completo;
            items_validos2[i].push("D","D","S","0303-010001","DS00","","",descripcion_acomodada,cantidad_recibir_sin_igv,cantidad_recibir_sin_igv,0.00,cantidad_recibir,'01',0,"N",1,"UND","")
            //////////////////mone,moneitem,aigv,codi,codf,marc,umed,descripcion acomodada,preciounitario,tota,descuento,totn,codalm,costo,msto,ucon,ucom,obse
        }
        ////agregar la sumatoria completa para la modificacion de la cabesera aqui
        for(let y in items_validos2){
            cabesatota+=parseFloat(items_validos2[y][17]);
            cabesatotn+=parseFloat(items_validos2[y][19]);
        }
        ///retirado para luego revivir para los descuentos
        items_validos2["descuento"]=[numero_documento,cabesatota,parseFloat((cabesatota*0.18).toFixed(2)),cabesatotn];
        //////////
        res.status(200).json(items_validos2)
    }
    else{
        let items_validos3={};
        let comodin_dsc_cabesera=comodin_dsc+promcabesa[1];
        let cantidad_recibir=items_promos2[0][1]*items_promos2[0][2]*-1;
        let cantidad_recibir2=items_validos2[7]*cantidad_recibir;
        let cantidad_recibir_sin_igv=(cantidad_recibir2/1.18).toFixed(2);
        let comodin_completo=comodin_dsc_cabesera;
        comodin_completo.length>80 ? descripcion_acomodada=comodin_completo.substring(0,80) : descripcion_acomodada=comodin_completo;
        items_validos2.push("D","D","S","0303-010001","DS00","","",descripcion_acomodada,cantidad_recibir_sin_igv,cantidad_recibir_sin_igv,0.00,cantidad_recibir2,'01',0,"N",1,"UND","")
        items_validos3[0]=items_validos2;
        
        cabesatota+=parseFloat(items_validos2[17]);
        cabesatotn+=parseFloat(items_validos2[19]);

        items_validos3["descuento"]=[numero_documento,cabesatota,parseFloat((cabesatota*0.18).toFixed(2)),cabesatotn];
        console.log("q estoi enviando a ser mostrado en itemsvalidos2")
        console.log(items_validos2)
        console.log("q estoi enviando a ser mostrado")
        console.log(items_validos3)
        res.status(200).json(items_validos3)
    }
}

module.exports=descuento;