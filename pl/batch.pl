#! /usr/bin/perl -w

# Oct. 2o14
# eminem 

use 5.010;
use strict;
use warnings;

sub main{
	my $suf_process = "| node js/auto";
	$suf_process = "-test" if grep{$_ eq "-test"} @ARGV;

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
	my $cmd = "cat $list | ./parser $suf_process";
	system($cmd);
	die "ERROR" if $?;
}

#Entry 
main;


