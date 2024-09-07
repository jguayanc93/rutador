require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');

let {bcliente} = require('../funciones/cotizacion/cliente_buscar.js')
let {idcliente} = require('../funciones/cotizacion/cliente_identificar.js')
let {bproducto} = require('../funciones/cotizacion/buscar_producto.js')

router.use(express.json());

router.post('/busqueda',bcliente)

router.post('/identificador',idcliente)

router.post('/producto',bproducto)

module.exports=router