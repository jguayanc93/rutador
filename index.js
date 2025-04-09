require('dotenv').config();
const bd = require('./conexion/cadena.js')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const ruta = require('./rutas/rutas.js')

const app = express();

const port = process.env.PORT || 3000;
/////PROXY PASAR DE CABESERA
app.set('trust proxy','127.0.0.1');
// app.use(cors())
// app.use(cors({
//     origin:"https://landing.compudiskett.com.pe",
//     methods:['GET','POST'],
//     credentials:true
// }))

app.use(cors({
    origin:"http://127.0.0.1",
    methods:['GET','POST'],
    credentials:true
}))

app.use([express.json(),cookieParser(process.env.SECRET_PASS)])

// app.get('/v1',(req,res)=>{})
app.use(express.static('public'));
    
app.post('/v1',(req,res)=>{ res.status(200).json({"msg":"start checkpoint"}) })

app.use(process.env.BASE_URI+'/login',ruta.login);

app.use(process.env.BASE_URI+'/vendedor',ruta.vendedor);
////NO TE OLVIDES DE AGREGAR UNA NUEVA RUTA PARA LA MODIFICACION DE TUS COTIS
app.use(process.env.BASE_URI+'/coti',ruta.coti);

app.use(process.env.BASE_URI+'/prom',ruta.prom);

app.use(process.env.BASE_URI+'/cuotas',ruta.cuotas);

app.use(process.env.BASE_URI+'/lista',ruta.lista);

app.use(process.env.BASE_URI+'/reporte',ruta.reporte)

app.listen(port,()=>console.log("servicio levantado"))