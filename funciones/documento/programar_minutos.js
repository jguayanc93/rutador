require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');
const {hora,minutos} = require('./horarios');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let programar_minutos = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {factura,fecha,hora_escojida} = req.body;
    console.log(req.body)
    let vendedor_data='cadena';
    // // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,factura,fecha,hora_escojida) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,factura,fecha,hora_escojida)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,factura,fecha,hora_escojida); }
    });
}

let bd_consulta = (res,factura,fecha,hora_escojida)=>{
    let sp_sql="select documento,fecha,minutos from tbl01_api_programar where despacho=1 and fecha=@date and hora=@hour";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            let hoy=new Date();
            let mes_correcto=hoy.getMonth()+1;
            let concatenacion=hoy.getFullYear()+'-'+mes_correcto+'-'+hoy.getDate()
            let dia_certero=new Date(concatenacion);
            let fecha_escojida=new Date(fecha);
            let hora_sistema=hoy.getHours();
            let minuto_sistema=hoy.getMinutes();
            if(rows.length==0){
                if(fecha_escojida.getTime()>dia_certero.getTime()){
                    res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos});
                }
                else if(dia_certero.getTime() === fecha_escojida.getTime()){
                    if(hora[hora_escojida]==hora_sistema){
                        let objtolerancia={}
                        for(let tolerancia in minutos){
                            let minuto_cadena=minutos[tolerancia];
                            let minuto_comienso=minuto_cadena.substring(0,2);
                            if(parseInt(minuto_comienso)>minuto_sistema){
                                objtolerancia[tolerancia]=minutos[tolerancia];
                            }
                        }
                        res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":objtolerancia});
                    }
                    else if(hora[hora_escojida]>hora_sistema){
                        res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos});
                    }
                }
            }
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
                Object.assign(respuesta2,respuesta);
                console.log("lista de facturas programadas")
                console.log(respuesta2);

                ////////CALCULO DE MINUTOS DISPONIBLES
                let minutos_libres={};
                let minutos_tomados=[];
                for(let minutos in respuesta2){ minutos_tomados.push(respuesta2[minutos][2]); }
                console.log("cantidad de minutos tomados")
                console.log(minutos_tomados.length)

                /////////////DIRENCIAR LAS FECHAS OTRA VES
                if(fecha_escojida.getTime()>dia_certero.getTime()){
                    if(minutos_tomados.length==12){
                        console.log("todos los minutos ocupados de una fecha siguiente")
                        res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":{}});
                    }
                    else if(minutos_tomados.length<12){
                        console.log("chekear minutos disponibles de una fecha siguiente");
                        for(let min in minutos){
                            if(minutos_tomados.includes(min.toString())){}
                            else{ minutos_libres[min]=minutos[min]; }
                        }
                        console.log(minutos_libres);
                        res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos_libres});
                    }
                }
                else if(dia_certero.getTime() === fecha_escojida.getTime()){
                    console.log("hora escojida")
                    console.log(hora[hora_escojida])
                    if(hora[hora_escojida]==hora_sistema){
                        if(minutos_tomados.length==12){
                            console.log("todos los minutos ocupados")
                            res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":{}});
                        }
                        else if(minutos_tomados.length<12){
                            let objtolerancia={}
                            for(let tolerancia in minutos){
                                let minuto_cadena=minutos[tolerancia];
                                let minuto_comienso=minuto_cadena.substring(0,2);
                                if(parseInt(minuto_comienso)>minuto_sistema){
                                    objtolerancia[tolerancia]=minutos[tolerancia];
                                }
                            }
                            console.log("esto son los minutos validos y que no se perdieron aunqe no esten programados")
                            console.log(objtolerancia)
                            for(let min in objtolerancia){
                                if(minutos_tomados.includes(min.toString())){}
                                else{ minutos_libres[min]=objtolerancia[min]; }
                            }
                            // for(let min in minutos){
                            //     if(minutos_tomados.includes(min.toString())){}
                            //     else{ minutos_libres[min]=minutos[min]; }
                            // }
                            res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos_libres});
                        }
                    }
                    else if(hora[hora_escojida]>hora_sistema){
                        if(minutos_tomados.length==12){
                            console.log("todos los minutos ocupados")
                            res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":{}});
                        }
                        else if(minutos_tomados.length<12){
                            console.log("chekear minutos disponibles");
                            for(let min in minutos){
                                if(minutos_tomados.includes(min.toString())){}
                                else{ minutos_libres[min]=minutos[min]; }
                            }
                            console.log(minutos_libres);
                            res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos_libres});
                        }
                    }
                }
                // if(minutos_tomados.length==12){
                //     console.log("todos los minutos ocupados")
                //     res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":{}});
                // }
                // else if(minutos_tomados.length<12){
                //     console.log("chekear minutos disponibles");
                //     for(let min in minutos){
                //         if(minutos_tomados.includes(min.toString())){}
                //         else{ minutos_libres[min]=minutos[min]; }
                //     }
                //     console.log(minutos_libres);
                //     res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos_libres});
                // }
                
                // let objtolerancia={}
                // for(let tolerancia in minutos){
                //     let minuto_cadena=minutos[tolerancia];
                //     let minuto_comienso=minuto_cadena.substring(0,2);
                //     if(parseInt(minuto_comienso)>minuto_mentira){
                //         objtolerancia[tolerancia]=minutos[tolerancia];
                //     }
                // }
                // res.status(200).json({"fdata":factura,"ffecha":fecha,"minutos":minutos_libres});
            }
        }
    })
    consulta.addParameter('date',TYPES.VarChar,fecha);
    consulta.addParameter('hour',TYPES.VarChar,hora_escojida);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={programar_minutos}