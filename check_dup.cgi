#Ainala Sainadh   Account:  jadrn052
#CS645
#Spring 2018
#Project -1


use CGI;
use DBI;
use CGI::Session;
use CGI::Carp qw (fatalsToBrowser);

if(valid_user()) {
    send_to_main();   
    }
else {
    send_to_login_page();
    }
	


sub send_to_main{

my $host = 'opatija.sdsu.edu';
my $port = '3306';
my $database = 'jadrn052';
my $username = 'jadrn052';
my $password = 'stopper';
my $response = "";


my $database_source = "dbi:mysql:$database:$host:$port";
my $dbh = DBI->connect($database_source, $username, $password)
	or die "Cannot connect to DB";
	
my $q = new CGI;
my $sku = $q->param('sku');
	
my $sth = $dbh->prepare("SELECT sku FROM product where sku='$sku'");
$sth->execute();
my $number_of_rows = $sth->rows;
if($number_of_rows == 0) {
   $response = 1; #OK
	}
else {
	$response = 0; #DUPLICATE
	}

	$sth->finish();
$dbh->disconnect();
print "content-type: text/html\n\n";
print $response;
}

sub valid_user {
$q = new CGI;
my $cookiesid=$q->cookie("jadrn052SID"); 
my $session = new CGI::Session(undef, $cookiesid, {Directory=>'/tmp'});
my $sid = $session->id();
$OK = 0;  #not authorized
if($sid==$cookiesid)
{
    $OK = 1; #authorized
}
return $OK;
}


sub send_to_login_page {
    print <<END;
Content-type:  text/html
<html>
<head>
    <meta http-equiv="refresh" 
        content="0; url=http://jadran.sdsu.edu/~jadrn052/proj1/index.html" />
</head><body></body>
</html>
END
}