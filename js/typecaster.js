
//Yes
var format = require('./third').formatKey;
var genObjSlice = function(name) {
	return format("cocos2d::{0}* p${No}; " +
		"ok &= luaval_to_object<cocos2d::{0}>(tolua_S, ${Index}, \"cc.{0}\", &p${No})", 
		name);
}

var genUserSlice = function(name){
	return format("{0}* p${No}; " +
		"ok &= luaval_to_object<{0}>(tolua_S, ${Index}, \"user.{0}\", &p${No})", 
		name);
}

var genFunc = function() {
	return format(
		"if(!lua_isfunction(tolua_S, ${Index})){printf(\"warning: not a function!\");} " +
		"lua_pushvalue(tolua_S, ${Index}); " + 
		"int p${No} = luaL_ref(tolua_S, LUA_REGISTRYINDEX); " + 
		"assert(p${No}!=LUA_REFNIL);"
	);
}

var typeCaster = {
	"int":function(p){return "lua_tointeger(tolua_S, " + p + ")"},
	"float":function(p){return "lua_tonumber(tolua_S, " + p + ")"},
	"const char*":function(p){return "lua_tostring(tolua_S, " + p + ")"},
	"bool":function(p){return "lua_toboolean(tolua_S, " + p + ")"},
	"void*":function(p){return "(void*)lua_topointer(tolua_S, " + p + ")"},
	"Node*":genObjSlice("Node"),
	"FiniteTimeAction*":genObjSlice("FiniteTimeAction"),
	"SkeletonExAuto*":genUserSlice("SkeletonExAuto"),
	"ExLuaFunc":genFunc()
};

var typeOut = {
	"int":function(){return "lua_pushinteger(tolua_S, retval);\n";  },
	"float":function(){return "lua_pushnumber(tolua_S, retval);\n"; },
	"const char*":function(){return "lua_pushstring(tolua_S, retval);\n";},
	"bool":function(){return "lua_pushboolean(tolua_S, retval);\n"; },
	"SkeletonAnimation*":function(){ return "object_to_luaval<spine::SkeletonAnimation>(tolua_S, \"sp.SkeletonAnimation\", retval);\n";}
};

module.exports = {
	in:typeCaster,
	out:typeOut
};
