const m_unidades = require('./metrica_unidades')
const m_valorizado = require('./metrica_valorizado')

let descuento_correspondiente=(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica)=>{
    //////FALTA UN FOR PARA SABER EN Q NUMERO DE ITEM SE ENCUENTRA
    let numero_item=1;
    numero_item=Object.keys(cotdetalle).length;
    let cantidad_correspondiente_obtenida;
    tipometrica==1 ? cantidad_correspondiente_obtenida=m_valorizado() : cantidad_correspondiente_obtenida=m_unidades(res,nprom,cotdetalle,promcabesa,promdetalle,tipopromo,tipometrica,numero_item);
    return cantidad_correspondiente_obtenida;
}

module.exports=descuento_correspondiente;