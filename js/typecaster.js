
var typeCaster = {
	"int":function(p){return "lua_tointeger(tolua_S, " + p + ")"},
	"float":function(p){return "lua_tonumber(tolua_S, " + p + ")"},
	"const char*":function(p){return "lua_tostring(tolua_S, " + p + ")"},
	"bool":function(p){return "lua_toboolean(tolua_S, " + p + ")"},
	"Node*":"cocos2d::Node* p${No}; ok &= luaval_to_object<cocos2d::Node>(tolua_S, ${Index}, \"cc.Node\", &p${No})"
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
