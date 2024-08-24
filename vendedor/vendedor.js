require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');
////llamada de funciones especificas segun su path
let {chekeador,ven_cuota} = require('../funciones/ven_cuoto/cuota.js')
let {doc_factura} = require('../funciones/ven_modificar/modificar.js')

router.use(express.json());

router.post('/',(req,res)=>{})

// router.post('/cuota',chekeador)
router.post('/cuota',chekeador,ven_cuota)

router.post('/modificar',doc_factura)

router.post('/programar',(req,res)=>{})

router.post('/clientes',(req,res)=>{})

router.post('/pedidos',(req,res)=>{})

router.post('/cotizaciones',(req,res)=>{})

module.exports=router