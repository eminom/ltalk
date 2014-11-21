
//Yes
var format = require('./format').format;
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

var typeCaster = {
	"int":function(p){return "lua_tointeger(tolua_S, " + p + ")"},
	"float":function(p){return "lua_tonumber(tolua_S, " + p + ")"},
	"const char*":function(p){return "lua_tostring(tolua_S, " + p + ")"},
	"bool":function(p){return "lua_toboolean(tolua_S, " + p + ")"},
	"void*":function(p){return "(void*)lua_topointer(tolua_S, " + p + ")"},
	"Node*":genObjSlice("Node"),
	"FiniteTimeAction*":genObjSlice("FiniteTimeAction"),
	"SkeletonExAuto*":genUserSlice("SkeletonExAuto"),
};

var typeOut = {
	"int":function(){return "lua_pushinteger(tolua_S, retval);\n";  },
	"float":function(){return "lua_pushnumber(tolua_S, retval);\n"; },
	"const char*":function(){return "lua_pushstring(tolua_S, retval);\n";},
	"bool":function(){return "lua_pushboolean(tolua_S, retval);\n"; },
};

module.exports = {
	in:typeCaster,
	out:typeOut
};
