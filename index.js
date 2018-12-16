/*   Ainala Sainadh   Account:  jadrn052
     CS645
     Spring 2018
     Project -1
*/

$(document).ready(function () {
	$("[name='username']").val('');
	$("[name='username']").focus();	
	document.getElementById("resetButton").addEventListener("click", erase);
	window.onpopstate = function() {window.location.href="http://jadran.sdsu.edu/~jadrn052/proj1/index.html";};// From mozilla development network ( http:// developer.mozilla.org)
	history.pushState({},'');
	});
	
function erase()
{
    document.getElementById("Logform").reset();
    document.getElementById("notvalid").hidden = true;
}
