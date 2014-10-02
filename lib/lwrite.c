

#include <stdio.h>
#include <stdlib.h>
#include "lwrite.h"
#include "json/cJSON.h"

void paramEntry_writeRecursive(ParamEntry *param){
	if(!param){return;}
	paramEntry_writeRecursive(param->next);
	printf("<%s>,", param->typeString);
}


void funcEntry_write(FuncEntry *func){
	printf("  %s %s(", func->typeString, func->name);
	paramEntry_writeRecursive(func->param);
	printf(")%s\n", SymFuncEnd);
}

void funcEntry_writeRecursive(FuncEntry *func){
	if(!func){return;}
	funcEntry_writeRecursive(func->next);
	funcEntry_write(func);
}

#define _WRITE_PLAIN

#if defined(_WRITE_PLAIN)
void chExports_write(StructExports *ex){
	printf("structure %s {\n", ex->name);
	funcEntry_writeRecursive(ex->func);
	printf("}%s\n", SymStructEnd);
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


#if !defined(_WRITE_PLAIN)
void chExports_write(StructExports *ex){
	cJSON *root = cJSON_CreateObject();

	cJSON *thisStru = cJSON_CreateObject();
	cJSON_AddItemToObject(root, ex->name, thisStru);

	cJSON *func = cJSON_CreateObject();
	cJSON *staticFunc  = cJSON_CreateObject();
	funcEntry_writeRecursive_J(ex->func, func, staticFunc);
	cJSON_AddItemToObject(thisStru, "Object", func);
	cJSON_AddItemToObject(thisStru, "Static", staticFunc);

	//
	char * outs = cJSON_Print(root);
	printf("%s", outs);
	free(outs);
	cJSON_Delete(root);
}
#endif



