#! /usr/local/bin/node 

var fs = require('fs');
var loadStream = require('./loader');
var typeIn = require('./typecaster').in;
var typeOut= require('./typecaster').out;

function getFunctionSig(className, methodName){
	return "int lua_user_" + className + "_" + methodName + "(lua_State *tolua_S)";
}

function getPredecl(className, isStatic){
	var rv =   "  int argc = 0;\n  bool ok = true;\n";
	if(!isStatic){
		rv +=      "  " + className + "* cobj = nullptr;\n";
	}
	return rv;
}

function getErrorDecl(){
	var rv = "\n";
	rv +=    "#if COCOS2D_DEBUG >= 1 \n";
	rv +=    "  tolua_Error tolua_err;\n";
	rv +=    "#endif\n\n";
	return rv;
}

function getTableCheck(className, methodName){
	var rv = "\n#if COCOS2D_DEBUG >= 1 \n";
	rv +=    "  if(!tolua_isusertable(tolua_S, 1, \"user." + className + "\", 0, &tolua_err)) goto tolua_lerror;\n";
	rv +=    "#endif\n\n";
	rv +=    "\n";
	rv +=    "  cobj = (" + className + "*)tolua_tousertype(tolua_S, 1, 0);\n";
	rv +=    "\n";

	rv +=    "#if COCOS2D_DEBUG >= 1 \n";
	rv +=    "  if(!cobj)\n";
	rv +=    "  {\n";
	rv +=    "    tolua_error(tolua_S, \"invalid 'cobj' in function 'lua_" + className + "_" + methodName + "'.\");\n";
	rv +=    "    return 0;\n";
	rv +=    "  }\n";
	rv +=    "#endif\n\n"
	return rv;
}

function getArgcCheck(argcCount){
	var rv = "  argc = lua_gettop(tolua_S) - 1;\n";
	rv +=    "  if(argc == " + argcCount + ")\n";
	rv +=    "  {\n";
	rv +=    "    if(!ok) return 0;\n";
	return rv;
}

function getArgcCheckEnd(hasReturn, expected, name){
	var rv =    "    return " + (hasReturn ? 1:0) + ";\n";
	rv    +=    "  }\n";
	rv    +=    "  CCLOG(\"%s has wrong number of arguments: %d, was expecting %d\", \"" + 
					name + "\" , argc, " + expected + ");\n";
	return rv;
}

function getErrorSeg(clsName, methodName){
	var rv = "\n";
	rv    += "#if COCOS2D_DEBUG >= 1 \n"
	rv    += "  tolua_lerror:\n";
	rv    += "  tolua_error(tolua_S, \"#ferror in function 'lua_user_" + clsName + "_" + methodName + "'.\",  &tolua_err);\n";
	rv +=    "#endif\n";
	return rv;
}

function getParam(type, p){
	return typeIn[type](p);
}

function writeFunction(clsName, info, name, isStatic, writer){
	writer("///////Automatical for lua_" + clsName + "_" + name + "(...)\n");
	writer(getFunctionSig(clsName, name));
	//body
	writer("\n{\n");
	writer(getPredecl(clsName, isStatic));
	writer(getErrorDecl());
	writer(getTableCheck(clsName, name));
	writer(getArgcCheck(info.Param.length, name));

	for(var i=0;i<info.Param.length;++i){
		writer("    " + info.Param[i] + " p"+i+ " = " + getParam(info.Param[i], i+2));
	}

	writer("    ");
	if(info.Type == "void") {

	} else {
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
		if( i < info.Param.length - 1 ){
			writer(",");
		}
	}
	writer(");\n\n");
	//Calling over

	if(typeOut[info.Type]){
		writer("    " + typeOut[info.Type]());
		writer("\n");
	} else {
		if(info.Type != 'void'){
			writer("    ");
			writer("object_to_luaval<" + info.Type + ">(tolua_S, \"user." + clsName + "\",retval);\n");
		}
	}

	writer(getArgcCheckEnd(info.Type!='void', info.Param.length, name));
	writer(getErrorSeg(clsName, name));
	writer("  return 0;\n");

	writer("\n}\n\n\n");
}

function ParseOne(o, clsName){
	// console.log("structure ", name);
	// for(var i in o.Static){
	// 	console.log(i);
	// }
	//console.log("Object");
	var writer = function(d){ process.stdout.write(d);};
	writer("//Section for " + clsName);
	for(var i in o.Object){
		writeFunction(clsName, o.Object[i], i, false, writer);
	}
	for(var i in o.Static){
	  writeFunction(clsName, o.Static[i], i, true, writer);
	}
	writer("//Section for " + clsName + " over.\n");


	writer("int lua_register_user_" + clsName + "(lua_State *tolua_S)\n");
	writer("{\n");
	writer("  tolua_usertype(tolua_S, \"user." + clsName + "\");\n");
	writer("  tolua_cclass(tolua_S, \"" + clsName + "\", \"user." + 
		clsName + "\", \"cc." + o.Super + "\", nullptr);\n");
	writer("  tolua_beginmodule(tolua_S, \"" + clsName + "\");\n");


	var outs = function(sets){
		for(var i in sets){
			writer("    tolua_function(tolua_S, \"" + i + "\", lua_user_" + clsName +
						"_" + i + ");\n");
		}
	};
	outs(o.Object);
	outs(o.Static);

	writer("  tolua_endmodule(tolua_S);\n");
	writer("  std::string typeName = typeid(" + clsName + ").name();\n");
	writer("  g_luaType[typeName] = \"user." + clsName + "\";\n");
	writer("  g_typeCast[\"" + clsName + "\"] = \"user." + clsName + "\";\n");
	writer("  return 1;\n");
	writer("}\n");
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






