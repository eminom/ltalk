

#ifndef _LTALK_API_DEF_H__
#define _LTALK_API_DEF_H__

#include <stdio.h>

//#define DBGPrint(...)	{ printf(__VA_ARGS__); puts("");}
#define DBGPrint(...)

typedef struct tagParamEntry{
	char *typeString;
	struct tagParamEntry *next;
}ParamEntry;

void paramEntry_dispose(ParamEntry *param);
ParamEntry *paramEntry_create(const char *type);

typedef struct tagFuncEntry{
	char *typeString;
	char *name;
	int isStatic;
	ParamEntry *param;
	struct tagFuncEntry *next;
}FuncEntry;

void funcEntry_dispose(FuncEntry *entry);
FuncEntry* 
funcEntry_create(const char *type, const char *name, int isStatic);

typedef struct tagStructExports{
	char *name;
	FuncEntry *func;
	char *superClass;
	struct tagStructExports *next;
}StructExports;

extern StructExports *curEx;
extern ParamEntry *curParam;
extern FuncEntry *curFunc;
extern char* curTypeStr;
extern int curIsStatic;

void typeStr_set(const char* name);
void typeStr_dispose();

void chExports_dispose(StructExports *ex);
StructExports* chExports_create(const char *name, StructExports *prev);
void chExports_setName(StructExports *ex, const char *name);
void chExports_setSuperInfo(StructExports *ex, const char *superName);


//~ The debugging tools
void chVarSet_Test(int check);
int chVar_IsTest();

#endif
