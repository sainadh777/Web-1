#Ainala Sainadh   Account:  jadrn052
#CS645
#Spring 2018
#Project -1


use DBI;
use CGI;
use CGI::Session;
use CGI::Carp qw (fatalsToBrowser);


if(valid_user()) {
    send_to_main();   
    }
else {
    send_to_login_page();
    }

sub send_to_main{

my $host = "opatija.sdsu.edu";
my $port = "3306";
my $database = "jadrn052";
my $username = "jadrn052";
my $password = "stopper";
my $database_source = "dbi:mysql:$database:$host:$port";
my $response = "";

my $dbh = DBI->connect($database_source, $username, $password)
or die 'Cannot connect to db';

my $q = new CGI;
my $keyword = $q->param("sku");

my $query = "select sku,category.name as category ,vendor.name as vendor,vendorModel, description, features, cost, retail, quantity from product,vendor, category  where sku='$keyword' and vendor.id=product.venID and category.id=product.catID";

            
my $sth = $dbh->prepare($query);
$sth->execute();

while(my @row=$sth->fetchrow_array()) {    
    $response .= $row[0].",".$row[1].",".$row[2].",".$row[3].",".$row[4].",".$row[5].",".$row[6].",".$row[7].",".$row[8]."||";
    }
if($response) {
    $response = substr $response, 0, (length($response) - 2); 
    }    
unless($response) {
    $response = "Invalid";
    }    

$sth->finish();
$dbh->disconnect();
    
print "Content-type: text/html\n\n";
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