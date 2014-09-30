
#include "ltalkapi.h"
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <malloc.h>

void paramEntry_dispose(ParamEntry *param){
	ParamEntry *now = param;
	while(now){
		ParamEntry *old = now;
		now = now->next;
		free(old->typeString);
		free(old);
	}
}

ParamEntry *paramEntry_create(const char *type){
	ParamEntry *pe = (ParamEntry*)malloc(sizeof(ParamEntry));
	memset(pe, 0, sizeof(ParamEntry));
	pe->typeString = (char*)malloc(sizeof(char) * (1+strlen(type)));
	strcpy(pe->typeString, type);
	return pe;
}

void paramEntry_writeRecursive(ParamEntry *param){
	if(!param){return;}
	paramEntry_writeRecursive(param->next);
	printf("<%s>,", param->typeString);
}

void funcEntry_dispose(FuncEntry *entry){
	FuncEntry *now = entry;
	while(now){
		FuncEntry *old = now;
		now = now->next;

		if(old->param){
			paramEntry_dispose(old->param);
		}
		free(old->name);
		free(old->typeString);
		free(old);
	}
}

FuncEntry* funcEntry_create(const char *type, const char *name){
	FuncEntry *fe = (FuncEntry*)malloc(sizeof(FuncEntry));
	memset(fe, 0, sizeof(FuncEntry));
	fe->typeString = (char*)malloc(sizeof(char)*(1+strlen(type)));
	strcpy(fe->typeString, type);
	fe->name = (char*)malloc(sizeof(char)*(1+strlen(name)));
	strcpy(fe->name, name);
	return fe;
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

void typeStr_set(const char* name){
	if(curTypeStr){
		free(curTypeStr);
	}
	curTypeStr = (char*)malloc(sizeof(char) * (1+strlen(name)));
	strcpy(curTypeStr, name);
}

void typeStr_dispose(){
	if(curTypeStr){
		free(curTypeStr);
		curTypeStr = 0;
	}
}

void chExports_dispose(StructExports *ex){
	DBGPrint("%s (%p)",__FUNCTION__, ex);
	if(ex->func){
		funcEntry_dispose(ex->func);
	}
	free(ex->name);
	free(ex);
}

StructExports* chExports_create(const char *name){
	StructExports *ex = (StructExports*)malloc(sizeof(StructExports));
	memset(ex, 0, sizeof(StructExports));
	ex->name = (char*)malloc(sizeof(char)*(1+strlen(name)));
	strcpy(ex->name, name);
	DBGPrint("%s(%p)", __FUNCTION__, ex);
	return ex;
}

void chExports_write(StructExports *ex){
	printf("structure %s {\n", ex->name);
	funcEntry_writeRecursive(ex->func);
	printf("}%s\n", SymStructEnd);
}

void chExports_setName(StructExports *ex, const char *name){
	DBGPrint("setName %p",ex);
	if(ex->name){
		free(ex->name);
	}
	ex->name = (char*)malloc((strlen(name)+1)*sizeof(char));
	strcpy(ex->name, name);
}


StructExports *curEx = 0;
ParamEntry *curParam = 0;
FuncEntry *curFunc = 0;
char* curTypeStr = 0;
