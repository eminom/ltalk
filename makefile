SOURCE = lex.yy.c\
	y.tab.c\
	lib/ltalkapi.c\
	lib/lwrite.c\
	lib/json/cJSON.c

all:
	yacc -d ltalk.y
	lex -l ltalk.l
	cc -std=c99 -o parser $(SOURCE) -lm

clean:
	rm -rf parser
	rm -f y.tab.c y.tab.h lex.yy.c

