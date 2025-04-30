const m_unidades_conjunto = require('./metrica_unidades_conjunto')
const m_valorizado_conjunto = require('./metrica_valorizado_conjunto')

let descuento_correspondiente=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica)=>{
    //////FALTA UN FOR PARA SABER EN Q NUMERO DE ITEM SE ENCUENTRA
    let numero_item=1;
    numero_item=Object.keys(cotdetalle).length;
    let cantidad_correspondiente_obtenida;
    // tipometrica==1 ? cantidad_correspondiente_obtenida=m_valorizado_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,numero_item) : cantidad_correspondiente_obtenida=m_unidades_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,numero_item);
    if(tipometrica==1){
        cantidad_correspondiente_obtenida=m_valorizado_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,numero_item);
    }
    else{
        cantidad_correspondiente_obtenida=m_unidades_conjunto(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,numero_item);
    }
    return cantidad_correspondiente_obtenida;
}

module.exports=descuento_correspondiente;