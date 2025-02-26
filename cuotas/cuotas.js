require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');
////llamada de funciones especificas segun su path
let {verificar_cuota,cuota_general} = require('../funciones/reportes/cuota_general.js');
// let {chekeador,ven_cuota} = require('../funciones/ven_cuoto/cuota.js')
// let {doc_factura} = require('../funciones/ven_modificar/modificar.js')

router.use(express.json());
router.post('/general',verificar_cuota,cuota_general)

// router.post('/cuota',chekeador,ven_cuota)
// router.post('/modificar',doc_factura)

module.exports=router