const io = require('socket.io-client')('http://localhost:8001');
const fs = require('fs');
const checksum = require('checksum');

main();

function main(){

	fs.readFile("../teddy.obj",function(err,data){
		if(err){
			console.log("Reading Obj Failed.");
			process.exit();
		}
		else{ 
			// All Green, Ready to Send.
			const fcs = checksum(data.toString());
			
			io.emit('getFcs',fcs);
			io.emit('getObj',data.toString());
			io.emit('buildFbx');

			io.on('done',function(){
				console.log('done');
				process.exit();
			});

			io.on('error',function(errmsg){
				console.log('Error : ' + errmsg);
				process.exit();
			})
		}
	});

}