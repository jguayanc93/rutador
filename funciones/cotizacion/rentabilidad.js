require('dotenv').config();
// const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let rentabilidad = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {productos} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? calc_rentibilidad(res,productos) : res.status(401).send(vendedor_data);
}

let calc_rentibilidad = (res,objeto) => {
    let filtrado={};
    for(let indice in objeto){
        ///////////solo para el nombre
        let nombre=objeto[indice][0];
        ///////////solo para cantidad
        let cantidad=parseInt(objeto[indice][1]);
        ///////////solo para venta
        let venta=objeto[indice][3];
        ///////////solo para el descuento concedido
        let descuento=objeto[indice][4];
        ////solo para el totalisado
        let saca_descuento=parseFloat(objeto[indice][4])/100;
        let saca_tota_por_descuento= (parseFloat(objeto[indice][3])*saca_descuento).toFixed(2);
        let saca_tota_con_descuento= (parseFloat(objeto[indice][3])-saca_tota_por_descuento).toFixed(2);
        let totalisado=saca_tota_con_descuento*objeto[indice][1];
        ///////solo para el costo total
        let saca_costo=parseFloat(objeto[indice][2]).toFixed(2)*parseInt(objeto[indice][1]);
        //////solo para la diferencia
        let diferencia=(totalisado-(saca_costo).toFixed(2)).toFixed(2);
        /////solo para rentabilidad
        let rentabilidad=(diferencia/saca_costo).toFixed(4);
        ////RENTABILIDAD EN PORCENTAJE BORRAR MAS ADELANTE
        let renta=(parseFloat(rentabilidad)*100).toFixed(3);

        filtrado[indice]=[nombre,cantidad,venta,descuento,saca_costo,totalisado,diferencia,renta];
    }
    // return filtrado;
    res.status(200).json(filtrado);
}

let respuesta_rentabilidad=()=>{}

let bd_consulta = (res,sugerencia)=>{
    let sp_sql="select b.codi,b.monto,b.dsct,a.tipdsct,a.tipdsctoto,a.tipagrupa from mst_promocion a join dtl_promocion_progra b on b.idprom=a.idprom where YEAR(a.fecini)=YEAR(GETDATE()) AND MONTH(GETDATE()) BETWEEN MONTH(a.fecini) AND MONTH(a.fecfin) AND a.idprom=@promo";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            if(rows.length==0) res.status(401).send("sin resultados?");
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
                // console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('promo',TYPES.VarChar,caracter);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={rentabilidad}