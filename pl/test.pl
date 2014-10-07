#! /usr/bin/perl -w

use 5.010;
use strict;
use warnings;
use Cwd qw/getcwd/;

sub getFileList{
	my $cur = shift // die "no inputs";
	my @rv = ();
	opendir my $cd, $cur or die "cannot open $cur";
	while ( my $f = readdir $cd ){
		my $ff = $cur . '/' . $f;
		next if not -f $ff;
		next if not $f =~ /\.pak$/;
		#print $ff,"\n";
		push @rv, $ff;
	}
	closedir $cd;
	@rv;
}

sub main{
	my $cur = getcwd() . '/input';
	my @arr =	getFileList $cur;
	my $passed = 0;
	for(@arr){
		#print $_,"\n";
		my $cmd = "./parser < $_";
		`$cmd`;
		die "test failed: $_" if $?;
		$passed ++;
	}

	say "All $passed passed";

}


#Entry
main;

