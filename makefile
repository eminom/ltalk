all:
	yacc -d ltalk.y
	lex -l ltalk.l
	cc -std=c99 -o parser *.c

clean:
	rm -rf parser
	rm y.tab.c
	rm y.tab.h
	rm lex.yy.c

