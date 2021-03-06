#! /usr/local/bin/node 

var fs = require('fs');
var assert = require('assert');

var third = require('./third');
var loadStream = third.loader;
var typeIn = require('./typecaster').in;
var typeOut= require('./typecaster').out;
var format = third.formatKey;
var formatStr = third.format;
var trim = third.trim;


var __knownCCTypes = {
	Node:true,
	Sprite:true,
	GLProgram:true,
	Layer:true,
	Scene:true
};

function checkSpaceByType(type){
	if(__knownCCTypes.hasOwnProperty(type)){
		return "cc";
	}
	return "user";
}

function xchunk(tmplFilePath){
	assert(1  == arguments.length, "must be of length 1" );
	return fs.readFileSync(tmplFilePath).toString('utf8');
}

function getArgcCheck(argcCount){
	return format(xchunk('tmpl/argccheck'),{Argc:argcCount});
}

function getArgcCheckEnd(hasReturn, expected, name){
	return format(xchunk('tmpl/argccheckend'), 
		{Return:(hasReturn?1:0),
		 Method:name,
		 Expected:expected
		}
	);
}

function getParam(type, op){
	var rv;
	if(typeof typeIn[type] == 'function'){
		rv = formatStr("{0} p{1} = {2};\n", type, op.No, typeIn[type](op.Index));
	} else {
		rv = format(typeIn[type], op) + ";\n"; 
	}
	return rv;
}

function writeFunction(clsName, info, name, isStatic, writer){
	var op = {
    Class:clsName,
		Method:name,
		Static:(+isStatic?0:1),
		Space:'user',
		Return:('void' != info.Type ? 1:0),
		Expected:info.Param.length,
		Argc:info.Param.length,
		Check:(+isStatic?"table":"type"),
	};

	//FIRST
	writer(format(xchunk('tmpl/first'), op));
	for(var i=0;i<info.Param.length;++i){
		writer("    " +  getParam(info.Param[i], {No:i, Index:i+2}));
	}

	writer("    ");
	if(info.Type != "void") {
		writer(info.Type + " retval = ");
	}
	//Calling starts
	if(isStatic){
		writer(clsName + "::" + name + "(");
	} else {
	  writer("cobj->" + name + "(");
	}
	for(var i=0;i<info.Param.length;++i){
		writer("p"+i);
		if (i < info.Param.length - 1){
			writer(",");
		}
	}
	writer(");\n");
	//Calling over

	if(typeOut[info.Type]){
		writer("    " + typeOut[info.Type]());
		writer("\n");
	} else {
		if(info.Type != 'void'){
			writer("    ");
			var trimmedType = trim(info.Type, '*');
			writer(format(xchunk('tmpl/ret'),{Type:trimmedType, Class:clsName, Space:checkSpaceByType(trimmedType)}));
		}
	}

	//SECOND PART
	writer(format(xchunk('tmpl/second'),op));
	writer("\n");
}


function genBufferWriter(){
  var text = '';
  return {
    w:function(content){
      text = text + content;
    },
    r:function(){
      return text;
    }
  };
}

function ParseOne(o, clsName){
	// console.log("structure ", name);
	// for(var i in o.Static){
	// 	console.log(i);
	// }
	//console.log("Object");
	var writer = function(d){ process.stdout.write(d);};
	writer("//SECTION FOR [" + clsName + "]\n\n");
	for(var i in o.Object){
		writeFunction(clsName, o.Object[i], i, false, writer);
	}
	for(var i in o.Static){
	  writeFunction(clsName, o.Static[i], i, true, writer);
	}
	writer("//SECTION FOR [" + clsName + "] END.\n\n\n");

	//
	
	var h = genBufferWriter();
	var lineFmt = "    " + xchunk('tmpl/insert').trim() + "\n";
	var go = function(s){
	  for(var i in s){
	  	h.w(format(lineFmt, {
	  	  Method:i,
	  	  Space:'user',
	  	  Class:clsName
	  	 })
	  	);
		}//~for
	};
	go(o.Object);
	go(o.Static);
	var text = format(xchunk('tmpl/exports'), {
        Super:o.Super, 
				Class:clsName, 
				Space:"user", 
				Insert:h.r}
  );
	writer(text);
}

function main(){
	var stru = JSON.parse(loadStream());
	//console.log("##########################");
	//console.log(JSON.stringify(stru));
	for(var i in stru){
		ParseOne(stru[i], i);
	}
	//Write the exporters.

}

main();






