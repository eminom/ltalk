

#include <stdio.h>
#include <stdlib.h>
#include "lwrite.h"
#include "json/cJSON.h"

#define SymFuncEnd		"+"
#define SymStructEnd	"*"

void paramEntry_writeRecursive(ParamEntry *param){
	if(!param){return;}
	paramEntry_writeRecursive(param->next);
	printf("<%s>,", param->typeString);
}


void funcEntry_write(FuncEntry *func){
	printf("  ");
	if(func->isStatic){
		printf("static ");
	}
	printf("%s ", func->typeString);
	printf("%s", func->name);
	printf("(");
	paramEntry_writeRecursive(func->param);
	printf(")%s\n", SymFuncEnd);
}

void funcEntry_writeRecursive(FuncEntry *func){
	if(!func){return;}
	funcEntry_writeRecursive(func->next);
	funcEntry_write(func);
}

void chExports_writeSingle(StructExports *ex){
	printf("structure %s ", ex->name);
	if(ex->superClass){
		printf(": public %s ", ex->superClass);
	}
	printf("{\n");
	funcEntry_writeRecursive(ex->func);
	printf("}%s\n", SymStructEnd);
}

void chExports_writeRecursive(StructExports *ex){
	if(!ex){ return; }
	chExports_writeRecursive(ex->next);
	chExports_writeSingle(ex);
}

//#define _WRITE_PLAIN

#if defined(_WRITE_PLAIN)
void chExports_write(StructExports *ex){
	chExports_writeRecursive(ex);
}
#endif

void paramEntry_writeRecursive_J(ParamEntry *pe, cJSON *array){
  if(!pe){return;}
	paramEntry_writeRecursive_J(pe->next, array);
	cJSON_AddItemToArray(array, cJSON_CreateString(pe->typeString));
}

void funcEntry_write_J(FuncEntry *fe, cJSON *func, cJSON *staticFunc){
	cJSON *info = cJSON_CreateObject();
	cJSON_AddItemToObject(info, "Type", cJSON_CreateString(fe->typeString));
	cJSON_AddItemToObject(info, "Name", cJSON_CreateString(fe->name));

	cJSON *params = cJSON_CreateArray();
	paramEntry_writeRecursive_J(fe->param, params);
	cJSON_AddItemToObject(info, "Param", params);
	cJSON_AddItemToObject((fe->isStatic ? staticFunc : func), fe->name, info);
}

void funcEntry_writeRecursive_J(FuncEntry *fe, cJSON *func, cJSON *staticFunc){
	if(!fe){return;}
	funcEntry_writeRecursive_J(fe->next, func, staticFunc);
	funcEntry_write_J(fe, func, staticFunc);
}

void chExports_writeSingle_J(StructExports *ex, cJSON *root){
	cJSON *thisStru = cJSON_CreateObject();
	cJSON_AddItemToObject(root, ex->name, thisStru);

	cJSON *func = cJSON_CreateObject();
	cJSON *staticFunc  = cJSON_CreateObject();
	funcEntry_writeRecursive_J(ex->func, func, staticFunc);
	cJSON_AddItemToObject(thisStru, "Object", func);
	cJSON_AddItemToObject(thisStru, "Static", staticFunc);

	const char *superCls = "SuperNode"; //This is the default
	if(ex->superClass){	superCls = ex->superClass;}
	cJSON_AddItemToObject(thisStru, "Super", cJSON_CreateString(superCls));
}

void chExports_writeRecursive_J(StructExports *ex, cJSON *root){
	if(!ex){ return; }
	chExports_writeRecursive_J(ex->next, root);
	chExports_writeSingle_J(ex, root);
}

#if !defined(_WRITE_PLAIN)
void chExports_write(StructExports *ex){
	cJSON *root = cJSON_CreateObject();
	chExports_writeRecursive_J(ex, root);
	char *outs = cJSON_Print(root);
	printf("%s\n", outs);
	free(outs);
	cJSON_Delete(root);
}

#endif



