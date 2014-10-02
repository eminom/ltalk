
var typeCaster = {
	"int":function(p){return "lua_tointeger(tolua_S, " + p + ");\n"},
	"float":function(p){return "lua_tonumber(tolua_S, " + p + ");\n"},
	"const char*":function(p){return "lua_tostring(tolua_S, " + p + ");\n"},
	"bool":function(p){return "lua_toboolean(tolua_S, " + p + ");\n"},
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
