const {
	variables,
}	= require('./config/index.js');

const {
	port,
}	= variables;

const server	= require('./api/server.js');

server.listen(port, () => console.log(`\n=== Server listening on port ${ port } ===`));
