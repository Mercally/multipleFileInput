

$(document).ready(function(){
    var input = $('#input-1').multipleFileInput();

    var input2 = $('#input-2').multipleFileInput({
        "enableUpload": false
    });

    var input3 = $('#input-3').multipleFileInput({
        "enableDownload": false,
        "defaultFiles": [{
                "size":"1233",
                "name":"docTest.doc",
                "downloadUrl":"/Files/Download/docTest.doc",
                "path":"/Files/Download/",
                "removed": false
            },
            {
                "size":"12323",
                "name":"imgTest.png",
                "downloadUrl":"/Files/Download/imgTest.png",
                "path":"/Files/Download/",
                "removed": false
            }]
    });
});

function getSelectedFiles(){
    var files = $('#input-3').multipleFileInput().getArrFiles();
    alert(files.map(function(item){
        return item["name"];
    }).join(", "));
}

function destroyMultipleInputFile(){
    var files = $('#input-3').multipleFileInput().destroy();
}

function initialMultipleInputFile(){
    var input3 = $('#input-3').multipleFileInput({
        "enableDownload": false,
        "defaultFiles": [{
                "size":"1233",
                "name":"docTest.doc",
                "downloadUrl":"/Files/Download/docTest.doc",
                "path":"/Files/Download/",
                "removed": false
            },
            {
                "size":"12323",
                "name":"imgTest.png",
                "downloadUrl":"/Files/Download/imgTest.png",
                "path":"/Files/Download/",
                "removed": false
            }]
    });
}