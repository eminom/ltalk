all:
	yacc -d ltalk.y
	lex -l ltalk.l
	cc -std=c99 -o parser *.c

clean:
	rm -rf parser

