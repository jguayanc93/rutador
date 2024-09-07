require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');
////llamada de funciones especificas segun su path
let {chekeador,ven_cuota} = require('../funciones/ven_cuoto/cuota.js')
let {doc_factura} = require('../funciones/ven_modificar/modificar.js')
let {mostrar} = require('../funciones/documento/despacho.js')
let {mostrar2} = require('../funciones/documento/opcion2.js')
let {mostrar3} = require('../funciones/documento/opcion3.js')
let {mostrar4} = require('../funciones/documento/opcion4.js')
let {mostrar5} = require('../funciones/documento/opcion5.js')
let {actualisar} = require('../funciones/documento/correccion.js')
let {chekear} = require('../funciones/documento/revisar.js')

router.use(express.json());

router.post('/',(req,res)=>{})

// router.post('/cuota',chekeador)
router.post('/cuota',chekeador,ven_cuota)

router.post('/modificar',doc_factura)

router.post('/recomendacion',mostrar)
router.post('/opc2',mostrar2)
router.post('/opc3',mostrar3)
router.post('/opc4',mostrar4)
router.post('/opc5',mostrar5)
router.post('/actualisar',actualisar)
router.post('/revisar',chekear)
// router.post('/opc6',mostrar)

router.post('/programar',(req,res)=>{})

router.post('/clientes',(req,res)=>{})

router.post('/pedidos',(req,res)=>{})

router.post('/cotizaciones',(req,res)=>{})

module.exports=router