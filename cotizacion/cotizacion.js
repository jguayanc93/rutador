require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');

let {bcliente} = require('../funciones/cotizacion/cliente_buscar.js')
let {idcliente} = require('../funciones/cotizacion/cliente_identificar.js')
let {bproducto} = require('../funciones/cotizacion/buscar_producto.js')
let {rentabilidad} = require('../funciones/cotizacion/rentabilidad.js')
let {promocion} = require('../funciones/cotizacion/promociones.js')
let {crear} = require('../funciones/cotizacion/crear_cotizacion.js')
let {bcotizacion} = require('../funciones/cotizacion/buscar_cotizacion.js')

router.use(express.json());

router.post('/busqueda',bcliente)

router.post('/identificador',idcliente)

router.post('/producto',bproducto)

router.post('/rentabilidad',rentabilidad)

router.post('/opg',promocion)

router.post('/creacion',crear)

router.post('/buscar',bcotizacion)

module.exports=router