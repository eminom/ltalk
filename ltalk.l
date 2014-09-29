
%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define YYSTYPE char*
#include "y.tab.h"

int yylex(void);

//Ubuntu warns in this API
extern char *strdup(const char*);

//#define PRT(...)	{printf(__VA_ARGS__); puts("");}
#define PRT(...)
#define ERROR(...)  {fprintf(stderr, __VA_ARGS__); puts("");}

%}

%%
struct {
	PRT("struct");
	return TokenStruct;
}

[a-zA-Z][a-zA-Z0-9_]*  {
	PRT("var");
	yylval = strdup(yytext);
	return Var;
}

;   {
	PRT("semicolon");
	return TokenSemicolon;
}

\*  {
	PRT("star");
	return TokenStar;
}

,  {
	PRT("comma");
	return TokenComma;
}

\{  {
	PRT("left-brack");
	return TokenLeftBracket;
}

\}   {
  PRT("right-brack");
	return TokenRightBracket;
}

\[   {
  PRT("left-square");
	return TokenLeftSquare;
}

\]   {
  PRT("right-square");
	return TokenRightSquare;
}

\(	{
	PRT("left-moon");
	return TokenLeftMoon;
}

\)  {
	PRT("right-moon");
	return TokenRightMoon;
}

[ \t\n\r]         ;

.   {ERROR("Unknown token\n");
		 abort();
}

%%

int yywrap(void){
	return 1;
}









