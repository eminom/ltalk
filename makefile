SOURCE = lex.yy.c\
	y.tab.c\
	src/ltalkapi.c\
	src/lwrite.c\
	lib/json/cJSON.c

INCLUDE_DIRS = -I./lib\
	-I./src

all:
	yacc -d ltalk.y
	lex -l ltalk.l
	cc -std=c99 -o parser $(SOURCE) ${INCLUDE_DIRS} -lm

clean:
	rm -rf parser
	rm -f y.tab.c y.tab.h lex.yy.c

