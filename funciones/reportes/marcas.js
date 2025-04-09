require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {decodificador} = require('../jwt/decodificador')
const {objevacio} = require('../objvacio/reqbody')
const XLSX = require('xlsx')

let verificar_marca = (req,res,next) =>{
    // let safe_coki = req.signedCookie;
    let proto_coki = req.body;
    // objevacio(safe_coki) ? res.status(401).send("logeate") : next();
    objevacio(proto_coki) ? res.status(401).send("logeate") : next();
}

let mostrar_marcas = (req,res,next) =>{
    // let valid_coki = req.signedCookie;
    // let vendedor_data = decodificador(valid_coki);
    let raw_data=req.body;
    console.log(req.body)
    let codven='V0172';
    // typeof vendedor_data=='object' ? bd_conexion(res,mes,vendedor_data.payload.vendedor) : res.status(401).send(vendedor_data);
    typeof codven=='string' ? bd_conexion(res,codven) : res.status(401).send('vacio el cuerpo');
}

let bd_conexion=(res,codven)=>{    
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,codven); }
    });
}

let bd_consulta = (res,codven) =>{
    let sp_sql="select TRIM(b.marc) from tbl01itm a inner join prd0101 b on (b.codi=a.codi) inner join prd0108 c on (c.codi=a.codi) inner join dtl01fac d on (d.codi=a.codi) inner join dtl_kdd_cons_2024 e on (e.codi=a.codi) inner join dtl_kdd_cons_2025 f on (d.codi=a.codi) where b.estado=1 AND b.marc<>'' AND LEFT(b.codi,4)<>'0303' AND b.marc<>'ND'  AND YEAR(d.fecha)>=2024 AND e.tmov='E' AND e.codglo in ('01','02') AND f.tmov='E' AND f.codglo in ('01','02') group by b.marc";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){
            console.log(err);
            res.status(401).send("error interno");
        }
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
                        typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value.toFixed(2);
                        contador++;
                    })
                    respuesta.push(tmp);
                });
                Object.assign(respuesta2,respuesta);
                // console.log(respuesta2);
                console.log("tengo las marcas validas")
                ////CREAR UN EXEL PARA MANDAR SU REPORTE A DESCARGAR
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
                ////////////////////////FORMATYO EXCEL
                // const worksheet=XLSX.utils.json_to_sheet(respuesta);
                // const workbook = XLSX.utils.book_new();
                // XLSX.utils.book_append_sheet(workbook,worksheet,"cuota general");
                // ///////cabesera
                // XLSX.utils.sheet_add_aoa(worksheet,[["familia","marca","cuota venta","cuota costo","cuota renta","cuota porcentaje","alcance venta","alcance costo","alcance cantidad","alcance renta","alcance porcentaje","porcentual venta","porcentual renta"]],{origin:"A1"});
                // ///columna anchura
                // worksheet["!cols"]=[{wch:16}];
                // ///////////BUFFER DE DATA CONVERTIDA                
                // let buf = XLSX.write(workbook,{type:"buffer",bookType:"xlsx"});
                // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                // res.setHeader('Content-Disposition','attachment; filename="general.xlsx"');
                // res.status(200).send(buf);
            }
        }
    })
    conexion.execSql(consulta);
}

module.exports={verificar_marca,mostrar_marcas}