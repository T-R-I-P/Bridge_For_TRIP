const spawn = require('child_process').spawn;

/*
*	@params: 
*			cmd		  : [string] main command to call
*			params	  : [list] parameters for cmd
*			next	  : [function] call_back function when it's done
*			nextparan : [list] parameters for next
*/
function spawnlist(cmd, params, next=null, nextparam=null,output=null,call_back=null){
	
	//console.log('start ' + params[0]);
	
	const sp = spawn(cmd, params);
	var out = "";
	sp.stdout.on('data',function(data){
		out += data;
	});
	sp.on('close',function(code){
		
		if(output){
			output[params[0]]= out;
		} else{
			output = [];
			output[params[0]] = out;
		}
		
		//console.log('done ' + params[0]);
		
		if(next != null){
			next(nextparam,output,call_back);
		} else{
			console.log('done');
			call_back(output);
		}
	})
}

const pinocchio = function(next,nextparam,call_back){
	spawnlist('sh',['pinocchio.sh'],next, nextparam,null,call_back);
}
const buildfbx = function(next,output,call_back){
	spawnlist('sh',['buildfbx.sh'],next,null,output,call_back);
}
const cleanup = function(next,output,call_back){
	spawnlist('sh',['cleanup.sh'],null,null,output,call_back);
}

module.exports.call_sh = function(call_back){ pinocchio(buildfbx,cleanup,call_back) };