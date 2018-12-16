//window.onload = checkLoginStatus;
var vendor = "";
var category = "";
var SKUinDB = "";
var vendorIsPopulated;
var categoryIsPopulated;
var rowNumberToRemove = -1;


$(document).ready(function () {

   // checkLoginStatus();
    $("#tabs").tabs();

    vendorIsPopulated = false;
    categoryIsPopulated = false;
	
	document.getElementById("newproductform").onsubmit = validateForm;
    document.getElementById("editproductform").onsubmit = validateEditForm; 

    document.getElementById("submitbutton").disabled = true;
	
    document.getElementById("clearbutton").addEventListener("click", clearform);
    document.getElementById("editclearbutton").addEventListener("click", clearEditForm)

    document.getElementById("searchButton").addEventListener("click", searchSKU);
    document.getElementById("deleteSearchButton").addEventListener("click", deleteSearchSKU);



    document.getElementById("sku").onkeydown = addSKUFormat;
    $("#sku").keydown(addSKUFormat);
    $("#editsku").keydown(addEditSKUFormat);
    document.getElementById("editsku").onkeydown = addEditSKUFormat;

    document.getElementById("sku").onfocus = clearSKUError;
    document.getElementById("editsku").onfocus = clearEditSKUError;

    document.getElementById("sku").onblur = checkForDuplicateSKU;
    document.getElementById("editsku").onblur = checkForDuplicateEditSKU;

    document.getElementById("editproductform").hidden = true;

    document.getElementById("noSearchResults").hidden = true;
    document.getElementById("noDeleteSearchResults").hidden = true;

    document.getElementById("search").onfocus = clearNoResults;
    //document.getElementById("search").onkeypress = detectEnterKey;
    $("#search").keydown(detectEnterKey);
    document.getElementById("deletesearch").onfocus = clearNoDeleteResults;
    //document.getElementById("deletesearch").onkeypress = deleteEnterKeyForDelete;
    $("#deletesearch").keydown(deleteEnterKeyForDelete);
    document.getElementById("isEditSKU").onchange = allowSKUEdit;
    
   // $.get('http://jadran.sdsu.edu/perl/jadrn052/vendor.cgi', handleVendor);
   // $.get('http://jadran.sdsu.edu/perl/jadrn052/category.cgi', handleCategory);


});

function detectEnterKey(event) {
    var key = event.keyCode || event.charCode;
    if (key == 13) {

        searchSKU();
    }
}

function allowSKUEdit() {
    if (document.getElementById("isEditSKU").checked == true) {
        document.getElementById("editsku").readOnly = false;

    } else {
        document.getElementById("editsku").readOnly = true;
    }

}

function deleteEnterKeyForDelete(event) {

    var key = event.keyCode || event.charCode;
    if (key == 13) {
        deleteSearchSKU();
    }
}

function clearNoResults() {
    document.getElementById("noSearchResults").hidden = true;
}

function clearNoDeleteResults() {
    document.getElementById("noDeleteSearchResults").hidden = true;
}

function searchSKU() {

    checkLoginStatus();

    var keyword = document.getElementById("search").value.trim();
    if (keyword.length > 0) {
        $.get('http://jadran.sdsu.edu/perl/jadrn052/search_sku.cgi?search=' + keyword, handleSearch);
    }
}

function deleteSearchSKU() {
   
   checkLoginStatus();

    var keyword = document.getElementById("deletesearch").value.trim();
    if (keyword.length > 0) {
        $.get('http://jadran.sdsu.edu/perl/jadrn052/search_sku.cgi?search=' + keyword, handleDeleteSearch);
    }

}


function handleSearch(response) {

    var rows = response.split('||');
    var tableHandle = $('[name="searchResults"]');
    var tableBody = $('[name="searchResultsBody"]');
    tableBody.find("tr").remove();
    document.getElementById("noSearchResults").hidden = true;
    document.getElementById("editproductform").hidden = true;
    if (response.length > 0) {
        tableBody.append($('<tr><th></th><th>SKU</th><th>Category</th><th>Vendor</th><th>vendorModel</th><th>Retail</th><th>Quantity</th></tr>'));
        for (i = 0; i < rows.length; i++) {
            var columns = rows[i].split('|');
            var row = $('<tr></tr>');
            tableBody.append(row);
            row.append($('<td><input class="editButton" type="button" id="Edit' + (i + 1) + '" value="Edit"></input></td>'));
            for (j = 0; j < columns.length; j++) {
                row.append($('<td></td>').text(columns[j]));
            }

            document.getElementById("Edit" + (i + 1)).addEventListener("click", editRecord);
        }
    }
    else {

        document.getElementById("noSearchResults").hidden = false;
    }
}

function handleDeleteSearch(response) {
    var rows = response.split('||');
    var tableHandle = $('[name="deleteSearchResults"]');
    var tableBody = $('[name="deleteSearchResultsBody"]');
    tableBody.find("tr").remove();
    document.getElementById("noDeleteSearchResults").hidden = true;

    if (response.length > 0) {
        tableBody.append($('<tr><th></th><th>SKU</th><th>Category</th><th>Vendor</th><th>vendorModel</th><th>Retail</th><th>Quantity</th></tr>'));
        for (i = 0; i < rows.length; i++) {
            var columns = rows[i].split('|');
            var row = $('<tr></tr>');
            tableBody.append(row);
            row.append($('<td><input class="deleteButton" type="button" id="Delete' + (i + 1) + '" value="Delete"></input></td>'));
            for (j = 0; j < columns.length; j++) {
                row.append($('<td></td>').text(columns[j]));
            }

            document.getElementById("Delete" + (i + 1)).addEventListener("click", deleteRecord);
        }
    }
    else {

        document.getElementById("noDeleteSearchResults").hidden = false;
    }

}

function editRecord() {
    
    checkLoginStatus();

    var rownumber = this.id.substring(4,this.id.length)
    var row = document.getElementById("searchResults").rows[rownumber];
    var sku = row.cells[0].innerHTML;
    $.get('http://jadran.sdsu.edu/perl/jadrn052/row_sku.cgi?sku=' + sku, populateEditForm);
}

function deleteRecord() {
   
    checkLoginStatus();

    if (confirm("Are you sure you want to delete the record?") == true) {
        var rownumber = this.id.substring(6, this.id.length)
        rowNumberToRemove = rownumber;
        var row = document.getElementById("deleteSearchResults").rows[rownumber];
        var sku = row.cells[1].innerHTML;
        //console.log(rownumber +":"+ sku);
        $.get('http://jadran.sdsu.edu/perl/jadrn052/deleteproduct.cgi?sku=' + sku, handleDeleteSKU);
    }

}

function handleDeleteSKU(response) {
    if (response == 1) {
        if (rowNumberToRemove != -1) {
            document.getElementById("deleteSearchResults").deleteRow(rowNumberToRemove);
            rowNumberToRemove = -1;
            alert("Record deleted successfully!");
        }
    }
    else {
        alert("Record does not exists");
    }
}

function populateEditForm(response) {

    document.getElementById("editproductform").hidden = false;
    document.getElementById("isEditSKU").checked = false;
    var rows = response.split('||');
    var columns = rows[0].split('|');
    SKUinDB = columns[0];
  
    document.getElementById("editsku").value = columns[0];
    document.getElementById("originalsku").value = columns[0];
    document.getElementById("editsku").readOnly = true;
	
    category = columns[1];
    vendor = columns[2];

    $.get('http://jadran.sdsu.edu/perl/jadrn052/category.cgi', handleEditCategory);
    $.get('http://jadran.sdsu.edu/perl/jadrn052/vendor.cgi', handleEditVendor);
  

    document.getElementById("editmanufactureid").value = columns[3];
    document.getElementById("editdescription").value = columns[4];
    document.getElementById("editproductfeatures").value = columns[5];
    document.getElementById("editcost").value = columns[6];
    document.getElementById("editretail").value = columns[7];
	document.getElementById("editquantity").value = columns[8];
    document.getElementById("editproductimage").setAttribute("src", "/~jadrn052/public_html/proj1/my_pics/" + columns[0].toLowerCase() + ".jpg");

}

function handleVendor(response) {
    var items = response.split('||');
    var vendorHandle = $('[id="vendor"]');

    vendorHandle.append($('<option value="0">Select Vendor</option>'));
    for (i = 0; i < items.length; i++) {
        var pairs = items[i].split('=');
        vendorHandle.append($('<option></option>').
            attr('value', pairs[0]).text(pairs[1]));
    }
}

function handleEditVendor(response) {
    var items = response.split('||');
    var vendorHandle = $('[id="editvendor"]');

    if (!vendorIsPopulated) {
        vendorHandle.append($('<option value="0">Select Vendor</option>'));
        for (i = 0; i < items.length; i++) {
            var pairs = items[i].split('=');
            vendorHandle.append($('<option></option>').
                attr('value', pairs[0]).text(pairs[1]));
        }
        vendorIsPopulated = true;
    }

    var element = document.getElementById('editvendor');
    for (var i = 0; i < element.options.length; i++) {
        if (element.options[i].text === vendor) {
            element.selectedIndex = i;
            break;
        }
    }
}


function handleCategory(response) {
    var items = response.split('||');
    var categoryHandle = $('[id="category"]');

    categoryHandle.append($('<option value="0">Select Category</option>'));
    for (i = 0; i < items.length; i++) {
        var pairs = items[i].split('=');
        categoryHandle.append($('<option></option>').
            attr('value', pairs[0]).text(pairs[1]));
    }

}

function handleEditCategory(response) {
    var items = response.split('||');
    var categoryHandle = $('[id="editcategory"]');

    if (!categoryIsPopulated) {
        categoryHandle.append($('<option value="0">Select Category</option>'));
        for (i = 0; i < items.length; i++) {
            var pairs = items[i].split('=');
            categoryHandle.append($('<option></option>').
                attr('value', pairs[0]).text(pairs[1]));
        }
        categoryIsPopulated = true;
    }

    var element = document.getElementById('editcategory');
    for (var i = 0; i < element.options.length; i++) {
        if (element.options[i].text === category) {
            element.selectedIndex = i;
            break;
        }
    }
}

function clearSKUError() {

    document.getElementById("submitbutton").disabled = true;
    document.getElementById("skustatus").innerHTML = "SKU must be of the format ABC-123";
    document.getElementById("skustatus").style.display = "none";
}
function clearEditSKUError() {

    document.getElementById("editsubmitbutton").disabled = true;
    document.getElementById("editskustatus").innerHTML = "SKU must be of the format ABC-123";
    document.getElementById("editskustatus").style.display = "none";
}

function addSKUFormat(event) {         // adapted from http://stackoverflow.com/questions/9906885/detect-backspace-and-del-on-input-event
    var key = event.keyCode || event.charCode;
    if (key != 8 && key != 9 && key != 46) {

        var sku = document.getElementById("sku");

        if (sku.value.length > 6) {
            sku.value = sku.value.substring(0, sku.value.length - 1);
        }
        sku.value = sku.value.toUpperCase();
        if (sku.value.length == 3) {
            sku.value = sku.value + "-";
        }

    }
}

function addEditSKUFormat(event) {
    var key = event.keyCode || event.charCode;
    if (key != 8 && key != 9 && key != 46) {

        var sku = document.getElementById("editsku");

        if (sku.value.length > 6) {
            sku.value = sku.value.substring(0, sku.value.length - 1);
        }
        sku.value = sku.value.toUpperCase();
        if (sku.value.length == 3) {
            sku.value = sku.value + "-";
        }

    }

}

function checkForDuplicateSKU() {

    if (validateSKU()) {
           checkLoginStatus();
        var skuvalue = document.getElementById("sku").value;
        $.ajax({
            url: "/perl/jadrn052/check_dup.cgi?sku=" + skuvalue,
            dataType: "html",
            success: function (data) {
                handleDuplicateSKU(data);
            },
            error: function () {
                document.getElementById("submitbutton").disabled = true;
            }
        });
    }
}

function checkForDuplicateEditSKU() {

    
    if (validateEditSKU()) {

        checkLoginStatus();
       
        if(document.getElementById("editsku").value.trim() == SKUinDB){
            document.getElementById("editsubmitbutton").disabled = false;
        }
        
        else{
            var skuvalue = document.getElementById("editsku").value.trim();
            $.ajax({
                url: "/perl/jadrn052/check_dup.cgi?sku=" + skuvalue,
                dataType: "html",
                success: function (data) {
                    handleDuplicateEditSKU(data);
                },
                error: function () {
                    document.getElementById("editsubmitbutton").disabled = true;
                }
            });
        }
        
    }

}

function handleDuplicateSKU(response) {
    if (response != 0) {
        document.getElementById("submitbutton").disabled = false;
        document.getElementById("skustatus").style.display = "none";
    }
    else {
        document.getElementById("submitbutton").disabled = true;
        document.getElementById("skustatus").innerHTML = "The SKU provided already exists.";
        document.getElementById("skustatus").style.display = "inline";
    }
}

function handleDuplicateEditSKU(response) {
    if (response != 0) {
        document.getElementById("editsubmitbutton").disabled = false;
        document.getElementById("editskustatus").style.display = "none";
    }
    else {
        document.getElementById("editsubmitbutton").disabled = true;
        document.getElementById("editskustatus").innerHTML = "The SKU provided already exists.";
        document.getElementById("editskustatus").style.display = "inline";
    }

}

function checkLoginStatus() {

    var re = new RegExp("jadrn052SID" + "=([^;]+)");                  // Code to retrieve cookie adapted from http://www.the-art-of-web.com/javascript/getcookie/
    var mycookie = re.exec(document.cookie);

    if (mycookie == null || mycookie == "") {

        window.location = "http://jadran.sdsu.edu/~jadrn052/proj1/";
    }

}

function clearform() {
    document.getElementById("newproductform").reset();
    document.getElementById("sku").focus();
}

function clearEditForm() {
    document.getElementById("editproductform").reset();
    document.getElementById("editsku").focus();
}

function validateForm() {

    if (validateSKU()) {
		
		if (validateCategory()) {

            if (validateVendor()) {

                if (validateCost()) {
					
					 if (validateRetail()) {

                        if (validateQuantity()) {
                        return true;
                        }

                    }
                }
            }
        }
	}
    return false;
}

function validateEditForm() {

    if (validateEditSKU()) {

        if (validateEditCategory()) {
				
			if (validateEditVendor()) {

                if (validateEditCost()) {
					
					 if (validateEditRetail()) {
               
                        if (validateEditQuantity()) {
                          return true;
                        }

                    }
                }
            }
        }
	}
    return false;
}


function validateSKU() {

    var sku = document.forms["newproductform"].sku.value;

    var pattern = new RegExp("^[A-Z]{3}-[0-9]{3}$");
    if (sku != "") {
        if (!pattern.test(sku)) {

            document.getElementById("skustatus").innerHTML = "SKU must be of the format ABC-123";
            document.getElementById("skustatus").style.display = "inline";
            return false;
        }
    }

    document.getElementById("skustatus").style.display = "none";
    return true;

}


function validateCategory() {
    var category = document.getElementById("category");
    var selectedValue = category.options[category.selectedIndex].value;
    if (selectedValue == "Select Category") {
        alert("Please select a category");
        return false;
    }
    return true;
}

function validateVendor() {
    var vendor = document.getElementById("vendor");
    var selectedValue = vendor.options[vendor.selectedIndex].value;
    if (selectedValue == "Select Vendor") {
        alert("Please select a vendor");
        return false;
    }
    return true;
}


function validateCost() {

    var cost = document.forms["newproductform"].cost.value;
    pattern = new RegExp("^[0-9]*(\.[0-9]{2})?$");

    if (!pattern.test(cost)) {
        alert("Cost must be a valid amount. (ex: 11.50 or 6.50)");
        return false;
    }
    return true;
}

function validateRetail() {
    var retail = document.forms["newproductform"].retail.value;
    pattern = new RegExp("^[0-9]*(\.[0-9]{2})?$");


    if (!pattern.test(retail)) {
        alert("Retail must be a valid amount. (ex: 11.50 or 6.50)");
        return false;
    }
    return true;

}

function validateQuantity() {

    var quantity = document.forms["newproductform"].quantity.value;
    pattern = new RegExp("^[0-9]*(\.[0-9]{2})?$");

    if (!pattern.test(quantity)) {
        alert("quantity must be a valid number. (ex: 25 or 35)");
        return false;
    }
    return true;
}
function validateEditSKU() {

    var sku = document.forms["editproductform"].sku.value;
    var pattern = new RegExp("^[A-Z]{3}-[0-9]{3}$");
    if (sku == SKUinDB) {
        return true;
    }
    if (sku != "") {
        if (!pattern.test(sku)) {
            document.getElementById("editskustatus").innerHTML = "SKU must be of the format ABC-123";
            document.getElementById("editskustatus").style.display = "inline";
            return false;
        }
    }

    document.getElementById("editskustatus").style.display = "none";
    return true;

}


function validateEditCategory() {
    var category = document.getElementById("editcategory");
    var selectedValue = category.options[category.selectedIndex].value;
    if (selectedValue == "Select Category") {
        alert("Please select a category");
        return false;
    }
    return true;
}

function validateEditVendor() {
    var vendor = document.getElementById("editvendor");
    var selectedValue = vendor.options[vendor.selectedIndex].value;
    if (selectedValue == "Select Vendor") {
        alert("Please select a vendor");
        return false;
    }
    return true;
}

function validateEditCost() {

    var cost = document.forms["editproductform"].cost.value;
    pattern = new RegExp("^[0-9]*(\.[0-9]{2})?$");

    if (!pattern.test(cost)) {
        alert("Cost must be a valid amount. (ex: 1.50 or .50)");
        return false;
    }
    return true;
}

function validateEditRetail() {
    var retail = document.forms["editproductform"].retail.value;
    pattern = new RegExp("^[0-9]*(\.[0-9]{2})?$");
 

    if (!pattern.test(retail)) {
        alert("Retail must be a valid amount. (ex:5.50 or 10.50)");
        return false;
    }
    return true;

}

function validateEditQuantity() {

    var quantity = document.forms["editproductform"].quantity.value;
    pattern = new RegExp("^[0-9]*(\.[0-9]{2})?$");

    if (!pattern.test(quantity)) {
        alert("quantity must be a valid number. (ex: 25 or 35)");
        return false;
    }
    return true;
}
