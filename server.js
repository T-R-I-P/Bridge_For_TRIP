const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const checksum = require('checksum');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

const ip = '127.0.0.1';
const port = '8001';
const _this = this;

var fcs = '',
	teddy = '',
	log = '',
	Fbxfcs = '', 
	MeshFcs = '', 
	Polyfcs = '', 
	Skelfcs = '',
	id = ''
	;

main();

function main(){

	app.use(express.static('files'));
	app.get('/fbx', function(req, res){
		res.sendFile(path.resolve('../Done/Pinocchio.fbx'));
	});
	app.get('/mesh', function(req, res){
		res.sendFile(path.resolve('../Done/_Dump/teddy.json'));
	});
	app.get('/poly', function(req, res){
		res.sendFile(path.resolve('../Done/_Dump/teddy_poly.json'));
	});
	app.get('/skeleton', function(req, res){
		res.sendFile(path.resolve('../Done/_Dump/skeleton.json'));
	});
	
	app.get('/stat', function(req, res){
		res.sendFile(path.resolve('../Done/_Dump/stats.json'));
	});

	/* Bugs ******************************************/
	app.get('/log', function(req, res){
		var log = _this.log;
		res.send( '<%= this.log %=>' );
	});
	app.get('/id', function(req, res){
		res.send(_this.id);
	});
	app.get('/fbx_fcs', function(req, res){
		res.send(_this.Fbxfcs);
	});
	app.get('/mesh_fcs', function(req, res){
		res.send(_this.Meshfcs);
	});
	app.get('/poly_fcs', function(req, res){
		res.send(_this.Polyfcs);
	});
	app.get('/skel_fcs', function(req, res){
		res.send(_this.Skelfcs);
	});
	/*******************************************/
	
	http.listen(port, function(req,res){
		console.log('listening on *:' + port);
	});

	io.on('connection', function(socket){

		var handshake = socket.handshake;
		console.log('========================================================');
		console.log('a user connected: ' + handshake.address + ", id = " + socket.id);
		_this.id = socket.id;
		
		socket.on('disconnect', function(){
			console.log('user ' + _this.id + 'disconnected');
			console.log('========================================================');
		});

		socket.on('getFcs',function(infos){
			_this.fcs = infos.toString();
		});

		socket.on('getObj',function(infos){
			_this.teddy = infos.toString();
		});

		socket.on('buildFbx',function(){
			if(_this.fcs != checksum(_this.teddy)){
				console.log("Checksum... failed!");
				io.emit('error','Checksum failed!');
				// After cilent recieve on('error'), it will disconnect itself.
				// socket.disconnected();
			}
			else{
				console.log("Checksum... passed!");
				fs.writeFile( __dirname + "/teddy.obj",function(err){
					if(err){
						console.log("Save Obj failed!");
						io.emit('error','Save Obj Failed.');
					} else{
						console.log("Save Obj... Success!");
						call_sh(function pullback(log){
							// Server side work all done.
							saveStats(log);
						});
					}
				});
			}
		});

	});
}

function saveStats(log){
	var Fbxchecksum = checksum(path.resolve('../Done/Pinocchio.fbx'));
	console.log('Fbx Checksum = ' + Fbxchecksum);

	var Meshchecksum = checksum(path.resolve('../Done/_Dump/teddy.json'));
	console.log('Mesh Checksum = ' + Meshchecksum);

	var Polychecksum = checksum(path.resolve('../Done/_Dump/teddy_poly.json'));
	console.log('Polygon Checksum = ' + Polychecksum);

	var Skelchecksum = checksum(path.resolve('../Done/_Dump/skeleton.json'));
	console.log('Skeleton Checksum = ' + Skelchecksum);

	// log err
	var j = {
		'id' : _this.id,
		'log' : 1 + log,//JSON.parse('{' + log + '}'),
		'fcs' : {
			'mesh' : Meshchecksum,
			'poly' : Polychecksum,
			'skel' : Skelchecksum
		}
	};
	
	console.log(j.log);
	
	fs.writeFile('../Done/_Dump/stats.json',JSON.stringify(j,null,4),function(err){
		if(err){
			console.log('Error When dumping stats.json');
		}
		else{
			console.log("System All Done.");
			io.emit('done');
		}
	});
}

function call_sh(call_back){
	/*
	*	@params: 
	*			cmd		  : [string] main command to call
	*			params	  : [list] parameters for cmd
	*			next	  : [function] call_back function when it's done
	*			nextparan : [list] parameters for next
	*			output 	  : [dict] output log for each stage
	*/
	function spawnlist(cmd, params, next=null, nextparam=null,output=null){
		
		const sp = spawn(cmd, params);
		var out = "";
		sp.stdout.on('data',function(data){
			out += data;
		});
		sp.on('close',function(code){
			console.log('Stage: ' + params[0] + ' Done with code ' + code);
			if(code != 0){
				console.log('buildFbx... Failed');
				console.log('Error at stage : ' + params[0].toString());
				io.emit('error','buildFbx Error at stage : ' + params[0].toString());
			}
			
			if(output){
				output[params[0]]= out;
			} else{
				output = [];
				output[params[0]] = out;
			}
				
			if(next != null){
				next(nextparam,output);
			} 
			else{ 
				// Finish Building Pipeline
				console.log('buildFbx... Success');
				call_back(output);
			}
		})
	}

	const pinocchio = function(next,nextparam){
		spawnlist('sh',['pinocchio.sh'],next, nextparam);
	}
	const buildfbx = function(next,output){
		spawnlist('sh',['buildfbx.sh'],next,null,output);
	}
	const cleanup = function(next,output,call_back){
		spawnlist('sh',['cleanup.sh'],null,null,output);
	}

	pinocchio(buildfbx,cleanup);
};
