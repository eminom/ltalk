

%{

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>

#define YYSTYPE	char*
int yylex(void);
void yyerror(char *);
extern int yylineno;

//#define DBGPrint(...)	{ printf(__VA_ARGS__); puts("");}
#define DBGPrint(...)


#define SymStructEnd	"*"
#define SymFuncEnd		":"


typedef struct tagParamEntry{
	char *typeString;
	struct tagParamEntry *next;
}ParamEntry;

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

typedef struct tagFuncEntry{
	char *typeString;
	char *name;
	ParamEntry *param;
	struct tagFuncEntry *next;
}FuncEntry;

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

typedef struct tagStructExports{
	char *name;
	FuncEntry *func;
	//No next for now
}StructExports;

StructExports *curEx = 0;
ParamEntry *curParam = 0;
FuncEntry *curFunc = 0;

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

StructExports* chExports_write(StructExports *ex){
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


//
#define PRINT(...)

%}

%token Var
%token TokenLeftBracket
%token TokenRightBracket
%token TokenLeftSquare
%token TokenRightSquare
%token TokenStruct
%token TokenSemicolon
%token TokenLeftMoon
%token TokenRightMoon
%token TokenComma

%%

StructDefinition:
StructHead StructBody TokenSemicolon{
	DBGPrint("Struct[%s] is defined", curEx->name);
	assert(curEx->func == 0);
	curEx->func = curFunc;
	curFunc = NULL;
	chExports_write(curEx);
}
;

StructHead:
TokenStruct Var{
	DBGPrint("[Struct] picks %s", $2);
	if(curEx){
		chExports_dispose(curEx);
	}
	curEx = chExports_create($2);
};

StructBody:
TokenLeftBracket InterfaceOp TokenRightBracket{
}
;

InterfaceMethod:
InterfaceMethodHead ParamOp TokenRightMoon{
	curFunc->param = curParam;
	curParam = NULL;
};

InterfaceMethodHead:
Var Var TokenLeftMoon{
	DBGPrint("[Func] picks %s %s", $1, $2);
	FuncEntry *func = funcEntry_create($1,$2);
	if(curFunc){
		func->next = curFunc;
		curFunc = func;
	} else {
		curFunc = func;
	}
};


ParamOp:
Param ParamTail { }
|{}
;

ParamTail:
TokenComma Param ParamTail{
}
|{   /*This must can be of empty*/}
;

Param:
Var Var{
	DBGPrint("[Param] picking %s", $1);     // Now
	ParamEntry *pe = paramEntry_create($1);  //Only type string
	if(curParam){
		pe->next = curParam;
		curParam = pe;
	} else {
		curParam = pe;
	}
}

InterfaceOp:
InterfaceMethod TokenSemicolon InterfaceOp{
	

}
| TokenSemicolon InterfaceOp {


}
| {/*DBGPrint("Empty !");*/}
;


%%

void yyerror(char *err){
	printf("error:%s, line %d\n", err, yylineno);
}

int main(void){
	if(yyparse()){
		printf("error parsing\n");
		return -1;
	}


	if(curEx){
		chExports_dispose(curEx);
	}

	return 0;
}
