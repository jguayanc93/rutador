require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');
const {hora,minutos} = require('./horarios');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let buscar_factura = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {factura,fecha} = req.body;
    console.log(req.body)
    let vendedor_data='cadena';
    // // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,factura,fecha) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,factura,fecha)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,factura,fecha); }
    });
}

let bd_consulta = (res,factura,fecha)=>{
    // let sp_sql="select TipEnt,cdocu,ndocu,nomcli,Codcdv,CodAlm,codven_usu,dirent,codtra2 from mst01fac where cdocu in ('01','03') and ndocu=@doc and flag='0'";
    // let sp_sql="select TipEnt,cdocu,ndocu,nomcli,Codcdv,CodAlm,codven_usu,dirent from mst01fac where cdocu in ('01','03') and ndocu=@doc and flag='0'";
    let sp_sql="select TipEnt,cdocu,ndocu,nomcli,Codcdv,CodAlm,codven_usu,dirent,codtra,codtra2 from mst01fac where cdocu in ('01','03') and ndocu=@doc and flag='0'";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            if(rows.length==0) res.status(200).json({"estado":"factura con guia"});
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
                // doc_tipo_entrega(res,fecha,respuesta2[0]);
                console.log(respuesta2[0]);
                // doc_revisar_programado(res,fecha,respuesta2[0]);
                doc_extraer_data(res,fecha,respuesta2[0]);
            }
        }
    })
    consulta.addParameter('doc',TYPES.VarChar,factura);
    conexion.execSql(consulta);
}

let doc_extraer_data=(res,fecha,factura_data)=>{
    let transporte_pronvicial
    let sp_sql="select fac.TipEnt,fac.cdocu,fac.ndocu,cliente.codcli,fac.nomcli,fac.Codcdv,fac.CodAlm,fac.codven_usu,vend.nomven,fac.dirent from mst01fac fac join tbl01ven vend on vend.codven=fac.codven_usu join tbl01tra tra on tra.codtra=fac.codtra join mst01cli cliente on cliente.codcli=fac.codcli where cdocu in ('01','03') and ndocu=@doc and flag='0'";
    if(factura_data[0]==3){
        transporte_pronvicial="T0001";
        sp_sql="select fac.TipEnt,fac.cdocu,fac.ndocu,cliente.codcli,fac.nomcli,fac.Codcdv,fac.CodAlm,fac.codven_usu,vend.nomven,fac.dirent,fac.codtra,tra.nomtra,depart.nomdep,provincia.nompro from mst01fac fac join tbl01ven vend on vend.codven=fac.codven_usu join tbl01tra tra on tra.codtra=fac.codtra join mst01cli cliente on cliente.codcli=fac.codcli join tbl01dep depart on (depart.coddep=cliente.coddep AND depart.codpai=cliente.codpai) join tbl01pro provincia on (provincia.codpro=cliente.codpro AND provincia.coddep=cliente.coddep AND provincia.codpai=cliente.codpai) where cdocu in ('01','03') and ndocu=@doc and flag='0'";
    }
    else if(factura_data[0]==4){
        sp_sql="select fac.TipEnt,fac.cdocu,fac.ndocu,cliente.codcli,fac.nomcli,fac.Codcdv,fac.CodAlm,fac.codven_usu,vend.nomven,fac.dirent,fac.codtra2,tra.nomtra,depart.nomdep,provincia.nompro from mst01fac fac join tbl01ven vend on vend.codven=fac.codven_usu join tbl01tra tra on tra.codtra=fac.codtra2 join mst01cli cliente on cliente.codcli=fac.codcli join tbl01dep depart on (depart.coddep=cliente.coddep AND depart.codpai=cliente.codpai) join tbl01pro provincia on (provincia.codpro=cliente.codpro AND provincia.coddep=cliente.coddep AND provincia.codpai=cliente.codpai) where cdocu in ('01','03') and ndocu=@doc and flag='0'";
        console.log("revisar para despues porqe puede que solo esta confirmado el tra cuando se genera la guia")
        console.log("modificar luego la consulta segun los campos de transportista cuando sus campos estan vacios")
        if(factura_data[9].trim()=='' && factura_data[8].trim()!='T0001'){
            transporte_pronvicial=factura_data[8].trim();
        }
        else if(factura_data[9].trim()!='' && factura_data[8].trim()=='T0001'){
            transporte_pronvicial=factura_data[9].trim();
        }
        else if(factura_data[9].trim()=='' && factura_data[8].trim()=='T0001'){
            transporte_pronvicial="desconocido";
        }
    }
    
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            if(rows.length==0) res.status(200).json({"estado":"factura extraccion falla"});
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
                // console.log(respuesta2[0]);
                // doc_revisar_programado(res,fecha,respuesta2[0]);
                fac_items_zonas(res,fecha,respuesta2[0]);
            }
        }
    })
    consulta.addParameter('doc',TYPES.VarChar,factura_data[2]);
    conexion.execSql(consulta);
}

let fac_items_zonas=(res,fecha,factura_data)=>{
    // let sp_sql="select almacen.zona,COUNT(almacen.zona) as cantidad from dtl01fac items join tbl01_api_almacen_zonas almacen on almacen.codi=items.codi where items.ndocu=@documento and items.codi<>'0303-010001' group by almacen.zona";
    let sp_sql="select almacen.zona from dtl01fac items join tbl01_api_almacen_zonas almacen on almacen.codi=items.codi where items.ndocu=@documento and items.codi<>'0303-010001' group by almacen.zona";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            if(rows.length==0) res.status(200).json({"detalle":"zonas no encontradas"});
            else{
                let respuesta=[];
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
                //////////REVISAR LAS ZONAS Y LA CANTIDAD
                let zones=[];
                for(let zone of respuesta) zone[0]=='' ? zones.push("desconocido") : zones.push(zone[0])
                doc_revisar_programado(res,fecha,factura_data,zones);
            }
        }
    })
    consulta.addParameter('documento',TYPES.VarChar,factura_data[2]);
    conexion.execSql(consulta);
}

let doc_revisar_programado=(res,fecha,factura_data,zonas)=>{
    // let sp_sql="select documento,fecha,hora,minutos from tbl01_api_programar where fecha=@date and documento=@doc";
    let sp_sql="select documento,fecha,hora,minutos from tbl01_api_programar where documento=@doc";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            if(rows.length==0) doc_tipo_entrega(res,fecha,factura_data,zonas)
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

                let factura_programada=[];
                for(let factura in respuesta2){ if(respuesta2[factura][0]==factura_data[2]) factura_programada.push(respuesta2[factura][0]); }

                // res.status(200).json({"estado":"factura ya programada"})
                if(factura_programada.length>0){ res.status(200).json({"estado":"factura ya programada"}) }
            }
        }
    })
    consulta.addParameter('date',TYPES.VarChar,fecha);
    consulta.addParameter('doc',TYPES.VarChar,factura_data[2]);
    conexion.execSql(consulta);
}

let doc_tipo_entrega=(res,fecha,factura_data,zonas)=>{
    // resolver lo de ventanilla despues para lo del direccionamiento
    // factura_data[0]==1 ? doc_ventanilla(res,fecha,factura_data) : doc_local(res,fecha,factura_data,zonas);
    doc_local(res,fecha,factura_data,zonas);
}
/////REVISAR ESTA CONSULTA PARA EL DESPACHO DE VENTANILLA
let doc_ventanilla=(res,fecha,factura_data)=>{
    let sp_sql="select documento,fecha,hora,minutos from tbl01_api_programar where despacho=1 and fecha=@date";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            // if(rows.length==0) res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":hora,"minutos":minutos});
            if(rows.length==0){
                /////ESPACIO PARA EL CALCULO ESPECIAL DE FECHA Y DISPONIBILIDAD DE PROGRAMACION
                let hoy=new Date();
                let mes_correcto=hoy.getMonth()+1;
                let concatenacion=hoy.getFullYear()+'-'+mes_correcto+'-'+hoy.getDate()
                let dia_certero=new Date(concatenacion);
                let fecha_escojida=new Date(fecha);
                let hora_sistema=hoy.getHours();
                
                if(fecha_escojida.getTime()>dia_certero.getTime()){
                    res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":hora})
                }
                else if(dia_certero.getTime() === fecha_escojida.getTime()){
                    let horas_libres={};
                    for(let h in hora){
                        if(hora[h]>=hora_sistema) horas_libres[h]=hora[h]
                    }
                    res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":horas_libres})
                }
                /////////////////////////////////
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
                /////////////////////////////ACOPLAR ESTO Y SUBSANAR
                let hoy=new Date();
                let mes_correcto=hoy.getMonth()+1;
                let concatenacion=hoy.getFullYear()+'-'+mes_correcto+'-'+hoy.getDate()
                let dia_certero=new Date(concatenacion);
                let fecha_escojida=new Date(fecha);
                let hora_sistema=hoy.getHours();
                
                if(fecha_escojida.getTime()>dia_certero.getTime()){
                    console.log("revisar las horas disponibles de otro dia")
                    res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":hora})
                    // res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":horas_libres});
                }
                else if(dia_certero.getTime() === fecha_escojida.getTime()){
                    //////revisar las horas disponibles q tengan espacio de minutos
                    let horas_libres={};
                    for(let h in hora){
                        if(hora[h]>=hora_sistema) horas_libres[h]=hora[h]
                    }
                    console.log(horas_libres);
                    res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":horas_libres});
                }
                // res.status(200).json({"fdata":factura_data,"ffecha":fecha,"horas":horas_libres});
            }
        }
    })
    consulta.addParameter('date',TYPES.VarChar,fecha);
    conexion.execSql(consulta);
}

let doc_local=(res,fecha,factura_data,zonas)=>{
    //////sacar zonas
    let z1=0
    let z2=0
    let z3=0
    let desconocido=0
    for (const zona of zonas) {
        if(zona=='desconocido'){desconocido++}
        else if(zona=='Z1'){z1++}
        else if(zona=='Z2'){z2++}
        else if(zona=='Z3'){z3++}
    }
    //////fechas obtenidas
    let hoy=new Date();
    let hora=hoy.getHours().toString();
    let minutos=hoy.getMinutes().toString();

    // let sp_sql="insert into tbl01_api_programar values(@fecha,@documento,@hora,@estado,@cliente,@despacho,@ejecutivo,@minutos,@reprogramado,@piking,@cheking,@agencia,@destino,@almacen,@nom_ejecutivo,@cod_cli,@codtra,@nomtra,@nomdep,@nompro)";
    let sp_sql="insert into tbl01_api_programar values(@fecha,@documento,@hora,@estado,@cliente,@despacho,@ejecutivo,@minutos,@reprogramado,@piking,@cheking,@cantzone,@destino,@almacen,@nom_ejecutivo,@cod_cli,@codtra,@nomtra,@nomdep,@nompro,@zonas,@zone1,@zone2,@zone3,@desconocido)";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            // if(rows.length==0) res.status(200).json({"estado":"factura programada"});
            if(rows.length==0){  doc_registrado(res,factura_data[2],zonas.length);  }
        }
    })
    consulta.addParameter('fecha',TYPES.VarChar,fecha);
    consulta.addParameter('documento',TYPES.VarChar,factura_data[2]);
    consulta.addParameter('hora',TYPES.VarChar,hora);
    consulta.addParameter('estado',TYPES.VarChar,'0');
    consulta.addParameter('cliente',TYPES.VarChar,factura_data[4]);
    consulta.addParameter('despacho',TYPES.Int,factura_data[0]);
    consulta.addParameter('ejecutivo',TYPES.VarChar,factura_data[7]);
    consulta.addParameter('minutos',TYPES.VarChar,minutos);
    consulta.addParameter('reprogramado',TYPES.VarChar,'N');
    consulta.addParameter('piking',TYPES.Int,0);
    consulta.addParameter('cheking',TYPES.Int,0);
    consulta.addParameter('cantzone',TYPES.Int,zonas.length);
    consulta.addParameter('destino',TYPES.VarChar,factura_data[9]);
    consulta.addParameter('almacen',TYPES.VarChar,factura_data[6]);
    consulta.addParameter('nom_ejecutivo',TYPES.VarChar,factura_data[8]);
    consulta.addParameter('cod_cli',TYPES.VarChar,factura_data[3]);
    consulta.addParameter('codtra',TYPES.VarChar,factura_data[10]);
    consulta.addParameter('nomtra',TYPES.VarChar,factura_data[11]);
    consulta.addParameter('nomdep',TYPES.VarChar,factura_data[12]);
    consulta.addParameter('nompro',TYPES.VarChar,factura_data[13]);
    consulta.addParameter('zonas',TYPES.VarChar,zonas.toString());
    consulta.addParameter('zone1',TYPES.Int,z1);
    consulta.addParameter('zone2',TYPES.Int,z2);
    consulta.addParameter('zone3',TYPES.Int,z3);
    consulta.addParameter('desconocido',TYPES.Int,desconocido);
    
    conexion.execSql(consulta);
}

let doc_registrado=(res,documento,cantidad)=>{
    let sp_sql="insert into tbl01_api_almacen_documento_impreso values(@documento,@z1imp,@z2imp,@z3imp,@desconocidoimp,@cantidad,@z1usr,@z2usr,@z3usr,@desconocidousr)";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            // if(rows.length==0) res.status(200).json({"estado":"factura programada"});
            doc_picking(res,documento,cantidad);
        }
    })
    consulta.addParameter('documento',TYPES.VarChar,documento);
    consulta.addParameter('z1imp',TYPES.Int,0);
    consulta.addParameter('z2imp',TYPES.Int,0);
    consulta.addParameter('z3imp',TYPES.Int,0);
    consulta.addParameter('desconocidoimp',TYPES.Int,0);
    consulta.addParameter('cantidad',TYPES.Int,cantidad);
    consulta.addParameter('z1usr',TYPES.VarChar,'');
    consulta.addParameter('z2usr',TYPES.VarChar,'');
    consulta.addParameter('z3usr',TYPES.VarChar,'');
    consulta.addParameter('desconocidousr',TYPES.VarChar,'');
    conexion.execSql(consulta);
}

let doc_picking=(res,documento,cantidad)=>{
    let sp_sql="insert into tbl01_api_almacen_documento_piking values(@documento,@z1pick,@z2pick,@z3pick,@desconocidopick,@cantidadpick,@z1conf,@z2conf,@z3conf,@desconocidoconf,@cantidadconf,@z1usr,@z2usr,@z3usr,@desconocidousr)";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            // if(rows.length==0) res.status(200).json({"estado":"factura programada"});
            // res.status(200).json({"estado":"factura programada"});
            doc_checking(res,documento,cantidad);
        }
    })
    consulta.addParameter('documento',TYPES.VarChar,documento);
    consulta.addParameter('z1pick',TYPES.Int,0);
    consulta.addParameter('z2pick',TYPES.Int,0);
    consulta.addParameter('z3pick',TYPES.Int,0);
    consulta.addParameter('desconocidopick',TYPES.Int,0);
    consulta.addParameter('cantidadpick',TYPES.Int,cantidad);
    consulta.addParameter('z1conf',TYPES.Int,0);
    consulta.addParameter('z2conf',TYPES.Int,0);
    consulta.addParameter('z3conf',TYPES.Int,0);
    consulta.addParameter('desconocidoconf',TYPES.Int,0);
    consulta.addParameter('cantidadconf',TYPES.Int,0);
    consulta.addParameter('z1usr',TYPES.VarChar,'');
    consulta.addParameter('z2usr',TYPES.VarChar,'');
    consulta.addParameter('z3usr',TYPES.VarChar,'');
    consulta.addParameter('desconocidousr',TYPES.VarChar,'');
    conexion.execSql(consulta);
}

let doc_checking=(res,documento,cantidad)=>{
    let sp_sql="insert into tbl01_api_almacen_documento_checking2 values(@documento,@ventanilla,@locaprovincia,@usr)";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            res.status(200).json({"estado":"factura programada"});
        }
    })
    consulta.addParameter('documento',TYPES.VarChar,documento);
    consulta.addParameter('ventanilla',TYPES.Int,0);
    consulta.addParameter('locaprovincia',TYPES.Int,0);
    consulta.addParameter('usr',TYPES.VarChar,'');
    conexion.execSql(consulta);
}

module.exports={buscar_factura}