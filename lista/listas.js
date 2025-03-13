require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');

let {blistacotis,blistacotisxdia} = require('../funciones/listas/cotizacion.js')
let {blistapedis,blistapedisxdia} = require('../funciones/listas/pedido.js')
let {blistafactus,blistafactusxdia} = require('../funciones/listas/factura.js')
let {blistaprogramar,blistaprogramarxdia} = require('../funciones/listas/despachar.js')

router.use(express.json());

router.post('/cotis',blistacotis)

router.post('/cotis/dia',blistacotisxdia)

router.post('/pedis',blistapedis)

router.post('/pedis/dia',blistapedisxdia)

router.post('/factus',blistafactus)

router.post('/factus/dia',blistafactusxdia)

router.post('/despacho',blistaprogramar)

router.post('/despacho/dia',blistaprogramarxdia)

module.exports=router