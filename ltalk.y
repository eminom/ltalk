

%{

#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#define YYSTYPE	char*
int yylex(void);
void yyerror(char *);
extern int yylineno;

typedef struct tagStructExports{
	char *name;
}StructExports;

StructExports *curEx=0;

void chExports_dispose(StructExports *ex){
	printf("dispose %p\n",ex);
	free(ex->name);
	free(ex);
}

StructExports* chExports_create(){
	StructExports *ex = (StructExports*)malloc(sizeof(StructExports));
	ex->name = 0;
	printf("create %p\n", ex);
	return ex;
}

void chExports_setName(StructExports *ex, const char *name){
	printf("setName %p\n",ex);
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
%token TokenInt
%token TokenFloat
%token TokenString
%token TokenSemicolon
%token TokenLeftMoon
%token TokenRightMoon
%token TokenVoid

%%

StructDefinition:
StructHead  StructBody TokenSemicolon{
	printf("Struct[%s] is defined\n", curEx->name);
}
;

StructHead:
TokenStruct Name{
	if(curEx){
		chExports_dispose(curEx);
	}
	curEx = chExports_create();
	chExports_setName(curEx, $2);
};


StructBody:
TokenLeftBracket InterfaceOp TokenRightBracket{
}
;

InterfaceOp:
TokenVoid Name TokenLeftMoon TokenRightMoon TokenSemicolon{
	printf("%s is void(*)()\n", $2);
}
;


Name:
Var{
	//printf("%s\n", $1);
}
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

	return 0;
}
