#Ainala Sainadh   Account:  jadrn052
#CS645
#Spring 2018
#Project -1

use CGI;
use CGI::Session;
use CGI::Carp qw (fatalsToBrowser);

my $q = new CGI;
my $sid = $q->cookie("jadrn052SID") || undef;
$session = new CGI::Session(undef, $sid, {Directory => '/tmp'});
$session->delete();
my $cookie = $q->cookie(jadrn052SID => '');
print $q->header( -cookie=>$cookie ); #send cookie with session ID to browser  


print <<END;    
    
<html>
<head>
<meta http-equiv="refresh" 
     content="0; url=http://jadran.sdsu.edu/~jadrn052/proj1/index.html" />
    
</head>
<body>
<h2>You are now logged out<h2>
</body>
</html>

END

