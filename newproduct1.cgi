
#!/usr/bin/perl 

#   file upload script.  
#   Remember that you MUST use enctype="mulitpart/form-data"
#   in the web page that invokes this script, and the destination 
#   directory for the uploaded file must have permissions set to 777.  
#   Do NOT set 777 permission on any other directory in your account!
#   


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
my $filename = $q->param("productimage");
unless($filename) {
    die "There was a problem uploading the image; ";        
    }
    
my ($name, $path, $extension) = fileparse($filename, '/..*/');

$filename = $q->param("sku").".jpg";
$filename =~ s/ //; #remove any spaces
if($filename !~ /^([$safe_filename_chars]+)$/) {
    die "Sorry, invalid character in the filename.";
    }   

$filename = untaint($filename);
$filename = lc($filename);
# get a handle on the uploaded image     
my $filehandle = $q->upload("productimage"); 

unless($filehandle) { die "Invalid handle"; }

# save the file
open UPLOADFILE, ">$upload_dir/$filename" or die
    "Error, cannot save the file.";
binmode UPLOADFILE;
while(<$filehandle>) {
    print UPLOADFILE $_;
    }
close UPLOADFILE;

insertProductToDB();

}

# this is needed because mod_perl runs with -T (taint mode), and thus the
# filename is insecure and disallowed unless untainted. Return values
# from a regular expression match are untainted.
sub untaint {
    if($filename =~ m/^(\w+)$/) { die "Tainted filename!"; }
    return $1;
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


sub insertProductToDB{

my $q = new CGI;
my $sku= $q->param("sku");
my $vendorid= $q->param("vendor");
my $categoryid= $q->param("category");
my $mfdid= $q->param("manufactureid");
my $desc= $q->param("description");
my $features= $q->param("productfeatures");
my $cost= $q->param("cost");
my $retail= $q->param("retail");

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

my $selectstatement="SELECT sku from products where sku='$sku';";
my $selectsth = $dbh->prepare($selectstatement);
$selectsth->execute();
my $count = 0;
while ($selectsth->fetch()) 
{
   $count = 1;
}

print "Content-type:  text/html\n\n";
if($count==1){

print "<h2> Cannot create record with duplicate SKU. Enter an unique SKU and try again! </h2>";
print "<a href=\"/~jadrn052/proj1/home.html\">HOME</a>\n";

return;
}



my $statement =$dbh->prepare("INSERT INTO products values(?,?,?,?,?,?,?,?)");
$statement->execute($sku,$vendorid,$categoryid,$mfdid,$desc,$features,$cost,$retail);

print "<html>";
print "<head>\n";
print "<link type=\"text/css\" rel=\"stylesheet\" href=\"/~jadrn052/proj1/newproduct.css\" />\n";

print "</head>\n";


#print "\nThe statement is\n$statement\n<br />";    

$how_many = $dbh->do($statement);
#print " $how_many rows affected\n<br />";


########################################################
### search for the product and display the data

$statement = "SELECT sku, vendor.name, category.name, mfdid, description, features,cost,retail ".
    " FROM vendor, category, products WHERE sku='$sku' and vendor.id=products.vendorid and ".
    " category.id=products.catid;";


#print "\nThe statement is\n$statement\n<br />";    
my $sth = $dbh->prepare($statement);
$sth->execute();

print "<h2>The following record was created successfully!</h2>";
print "<a href=\"/~jadrn052/proj1/home.html\">HOME</a>";
print"<table>\n";
print "<tr>\n";
print"<th>SKU</th> <th>Vendor</th> <th>Category</th> <th>Manufacturer's ID</th> <th>Description</th> <th>Features</th> <th>Cost</th> <th>Retail</th>";
print "</tr>\n";
print "<tr>\n";
while(my @rows = $sth->fetchrow_array()) {
    foreach $item (@rows) {
     print "<td>$item</td>";
        }
    print "</tr>\n";
    }
print "</table>\n";
my $imagename=lc($sku);
print "<img src=\"/~jadrn052/proj1/my_pics/$imagename.jpg\" />";
$sth->finish();
$dbh->disconnect();
}
