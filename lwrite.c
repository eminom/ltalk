

#include <stdio.h>
#include <stdlib.h>
#include "lwrite.h"



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


void chExports_write(StructExports *ex){
	printf("structure %s {\n", ex->name);
	funcEntry_writeRecursive(ex->func);
	printf("}%s\n", SymStructEnd);
}