#Ainala Sainadh   Account:  jadrn052
#CS645
#Spring 2018
#Project -1


use CGI;
use DBI;
use CGI::Session;
use CGI::Carp qw (fatalsToBrowser);
use File::Basename;


if(valid_user()) {
    send_to_main();   
    }
else {
    send_to_login_page();
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

sub send_to_main {
####################################################################
### constants
$CGI::POST_MAX = 1024 * 3000; # Limit file size to 3MB
my $upload_dir = '/home/jadrn052/public_html/proj1/my_pics';
my $safe_filename_chars = "a-zA-Z0-9_.-";
####################################################################


my $q = new CGI;
my $sku= $q->param("sku");
my $filename=lc($sku).".jpg";
my $response=0;
if(DeleteSKU()){
  unlink($upload_dir."/".$filename);
  $response=1;
}
 print "Content-type: text/html\n\n";
 print $response;
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


sub DeleteSKU{

my $q = new CGI;
my $sku= $q->param("sku");

my $host = "opatija.sdsu.edu";
my $port = "3306";
my $database = "jadrn052";
my $username = "jadrn052";
my $password = "stopper";
my $database_source = "dbi:mysql:$database:$host:$port";
my $response = "";

########################################################
### connect
my $dbh = DBI->connect($database_source, $username, $password)
or die 'Cannot connect to db';

my $selectstmnt="SELECT sku from product where sku='$sku';";
my $selectsth = $dbh->prepare($selectstmnt);
$selectsth->execute();
my $count = 0;
while ($selectsth->fetch()) 
{
   $count = 1;
}
$selectsth->finish();

if($count==0){
return 0;
}

my $deletestmnt="DELETE from product where sku='$sku'";
my $deletesth = $dbh->prepare($deletestmnt);
$deletesth->execute();

$dbh->disconnect();
return 1;

}