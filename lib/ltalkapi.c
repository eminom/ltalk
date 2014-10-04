
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

FuncEntry* 
funcEntry_create(const char *type, const char *name, int isStatic){
	FuncEntry *fe = (FuncEntry*)malloc(sizeof(FuncEntry));
	memset(fe, 0, sizeof(FuncEntry));
	fe->typeString = (char*)malloc(sizeof(char)*(1+strlen(type)));
	strcpy(fe->typeString, type);
	fe->name = (char*)malloc(sizeof(char)*(1+strlen(name)));
	strcpy(fe->name, name);
	fe->isStatic = isStatic;
	return fe;
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


void chExports_setName(StructExports *ex, const char *name){
	DBGPrint("setName %p",ex);
	if(ex->name){
		free(ex->name);
	}
	ex->name = (char*)malloc((strlen(name)+1)*sizeof(char));
	strcpy(ex->name, name);
}

void chExports_setSuperInfo(StructExports *ex, const char *superClass){
	DBGPrint("setSuperInfo %p", ex);
	if(ex->superClass){
		free(ex->superClass);
	}
	ex->superClass = (char*)malloc((strlen(superClass)+1)*sizeof(char));
	strcpy(ex->superClass, superClass);
};


StructExports *curEx = 0;
ParamEntry *curParam = 0;
FuncEntry *curFunc = 0;
char* curTypeStr = 0;
int curIsStatic = 0;
