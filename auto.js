#! /usr/local/bin/node 

var fs = require('fs');
var assert = require('assert');
var loadStream = require('./loader');
var typeIn = require('./typecaster').in;
var typeOut= require('./typecaster').out;
var format = require('./format').formatKey;

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

function getParam(type, p){
	return typeIn[type](p);
}

function writeFunction(clsName, info, name, isStatic, writer){
	var op = {
    Class:clsName,
		Method:name,
		Static:(+isStatic?0:1),
		Space:'user',
	};
	writer("///////Automatical for lua_" + clsName + "_" + name + "(...)\n");
	writer(format(xchunk('tmpl/func').trim(),op));

	//~body
	writer("\n{\n");
	writer(format(xchunk('tmpl/predecl'),op));
	writer(xchunk('tmpl/error'));
	writer(format(xchunk('tmpl/tablecheck'),op));
	writer(getArgcCheck(info.Param.length));
	for(var i=0;i<info.Param.length;++i){
		writer("    " + info.Param[i] + " p"+i+ " = " + getParam(info.Param[i], i+2));
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
			writer(format(xchunk('tmpl/retnode'),{Type:info.Type,Class:clsName, Space:'user'}));
		}
	}

	writer(getArgcCheckEnd(info.Type!='void', info.Param.length, name));
	writer(format(xchunk('tmpl/errseg'),op));
	writer("  return 0;\n");
	writer("}\n\n\n");
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
	writer("//SECTION FOR [" + clsName + "]");
	for(var i in o.Object){
		writeFunction(clsName, o.Object[i], i, false, writer);
	}
	for(var i in o.Static){
	  writeFunction(clsName, o.Static[i], i, true, writer);
	}
	writer("//SECTION FOR [" + clsName + "] END.\n\n\n");

	//
	
	var h = genBufferWriter();
	var lineFmt = xchunk('tmpl/insert');
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






