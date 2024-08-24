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

app.listen(port,()=>console.log("servicio levantado"))