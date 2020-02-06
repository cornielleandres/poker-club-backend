const express			= require('express');
const http				= require('http');

const server			= express();
const httpServer	= http.Server(server);

// utils
const {
	applySocketioAndRunJobs,
}	= require('../utils/index.js');

applySocketioAndRunJobs(httpServer);

module.exports = httpServer;
