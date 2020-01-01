const express			= require('express');
const http				= require('http');
const server			= express();
const httpServer	= http.Server(server);

// utils
const {
	applySocketio,
}	= require('../utils/index.js');

applySocketio(httpServer);

module.exports = httpServer;
