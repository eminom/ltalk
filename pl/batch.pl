#! /usr/bin/perl -w

# Oct. 2o14
# eminem 

use 5.010;
use strict;
use warnings;

sub main{
	my $inputs = 'input/includes';
	open my$fin, "<", $inputs or die "cannot open targets";
	my $list = "";
	while(<$fin>){
		chomp;
		next if not /^\$pfile/;
		die if not /\$pfile\s+([\w\/\.]+)/;
		`cat $1`;
		die if $?;
		$list = $list . ' ' . $1;
	}
	close $fin;
	my $cmd = "cat $list | ./parser | node js/auto ";
	system($cmd);
	die "ERROR" if $?;
}

#Entry 
main;


