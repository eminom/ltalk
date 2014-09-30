

%{

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>

#define YYSTYPE	char*
int yylex(void);
void yyerror(char *);
extern int yylineno;

#include "lib/ltalkapi.h"
#include "lib/lwrite.h"

%}

%token Var
%token TokenStatic
%token TokenStar
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
InterfaceMethodHead TokenLeftMoon ParamOp TokenRightMoon{
	curFunc->param = curParam;
	curParam = NULL;
};

TypeVar:
Var TokenStar  { 
	char buf[BUFSIZ];
	snprintf(buf, sizeof(buf), "%s*", $1);
	typeStr_set(buf);
}
|Var {
	typeStr_set($1);
}

MethodTypeVar:
TokenStatic TypeVar { curIsStatic = 1;}
|TypeVar { curIsStatic = 0; }
;

InterfaceMethodHead:
MethodTypeVar Var {
	DBGPrint("[Func] picks %s %s", curTypeStr, $2);
	FuncEntry *func = funcEntry_create(curTypeStr, $2, curIsStatic);
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

ParamName:
Var {
	//paramName_set($1);
}
|{ /*paramName_set("");*/}
;

Param:
TypeVar ParamName{
	DBGPrint("[Param] picking %s", curTypeStr);     // Now
	ParamEntry *pe = paramEntry_create(curTypeStr);  //Only type string
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
	typeStr_dispose();

	return 0;
}
