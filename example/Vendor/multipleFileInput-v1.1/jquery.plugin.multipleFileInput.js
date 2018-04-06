(function ($) {
    var ListInputs = [];
    $.fn.extend({
        multipleFileInput: function (initialObj) {
            
            var $this = $(this);
            var defaultExtsAllow = ".pdf, .doc, .docx, .txt, .rtf, .bmp, .jpg, .jpeg, .png, .gif, .tif, .ppt, .pptx, .pub, .xls, .xlsx, .vdx";
            var isSwal = (typeof swal === 'function');

            function _multipleFileInput(initialObj){
                var _$this = $this;

                for(var i = 0; i < ListInputs.length; i++){
                    if(ListInputs[i].attr("id") == _$this.attr("id")){
                        return ListInputs[i];
                    }
                }

                if(initialObj){
                    initialObj = new initMultipleFileInput(
                        initialObj["defaultFiles"]
                       ,initialObj["enableUpload"]
                       ,initialObj["enableDownload"]
                       ,initialObj["enableRemove"]
                       ,initialObj["extsAllow"]
                       ,initialObj["maxSizePerFile"]
                       ,initialObj["maxSizeForAllFiles"]
                   );
                }else{
                    initialObj = new initMultipleFileInput();
                }
                
                var arrFiles = [], newFiles = [], oldFiles = []
                ,currentSizeForAllFiles = 0
                ,maxSizePerFile = (initialObj["maxSizePerFile"] * 1024)
                ,maxSizeForAllFiles = (initialObj["maxSizeForAllFiles"] * 1024); // en bytes
                
                var _enableUpload = initialObj["enableUpload"]
                ,_enableDownload = initialObj["enableDownload"]
                ,_enableRemove = initialObj["enableRemove"]
                ,arrFilesExists = initialObj["defaultFiles"]
                ,extsAllow = initialObj["extsAllow"]
                ,countFiles = 0
                ,elementId = _$this.attr("id");

                for (var i = 0; i < arrFilesExists.length; i++) {
                    arrFiles.push(arrFilesExists[i]);
                }
    
                _$this.append('<input id="' + elementId + '-inputFiles" type="file" multiple>');
                $('input#' + elementId + '-inputFiles[type=file]').attr('accept', extsAllow).hide();
    
                var btnSearchFiles = '';
                if (_enableUpload) {
                    btnSearchFiles = '<button type="button" class="btn btn-primary btn-block" id="' + elementId + '-btn-search-file-to-load"><i class="fa fa-folder-open"></i>&nbspBuscar&nbsp;archivos</button>';
                } else {
                    btnSearchFiles = '<button type="button" class="btn btn-primary btn-block" disabled="disabled"><i class="fa fa-folder-open"></i>&nbspBuscar&nbsp;archivos</button>';
                }
    
                _$this.append(
                    '<table id="' + elementId + 'table-files-uploaded" width="100%" class="table table-bordered">\n' +
                    '<thead>\n' +
                    '</thead>\n' +
                    '<tbody>\n' +
                        '<tr id="' + elementId + '-hideableTrFile">\n' +
                            '<td colspan="2" width="100%">\n' +
                                '<div class="table-files-uploaded-tbody-div">\n'+
                                    '<table id="' + elementId + '-table-files-uploaded-body" class="table-hover table-files-uploaded-body" width="100%">\n'+
                                    '</table>\n'+
                                '</div>\n' +
                            '</td>\n' +
                        '</tr>\n' +
                    '</tbody>\n' +
                    '<tfoot>\n' +
                        '<tr id="' + elementId + '-drop-zone-files-uploaded-tr">\n'+
                            '<th colspan="2">\n'+
                                '<div id="' + elementId + '-drop-zone-files-uploaded" class="drop-zone-files-uploaded">Arrastre y suelte aquí los archivos...</div>\n'+
                            '</th\n>'+
                        '</tr>\n' +
                            '<tr>\n' +
                            '<th style="aling-text: right;">(<b id="' + elementId + '-countFiles-inputMultipleFile">0</b>) archivo(s) seleccionado(s)</th>\n' +
                            '<th width="30%">' + btnSearchFiles + '</th>\n' +
                        '</tr>\n' +
                    '</tfoot>\n' +
                    '</table>\n'
                );
    
                // bind events:
                if (_enableUpload) {
                    makeDroppable(elementId);
    
                    $('button#' + elementId + '-btn-search-file-to-load').on('click', function () {
                        callbackChange();
                    });
    
                    $('input#' + elementId + '-inputFiles[type=file]').change(function () {
                        var files = $(this).get(0).files;
                        addBatchFiles(files, extsAllow);
                    });
                } else {
                    $('#' + elementId + '-drop-zone-files-uploaded-tr').hide();
                }
    
                if (_enableRemove) {
                    $('body').on('click', 'button.' + elementId + '-btnRemoveFile', function () {
                        var index = parseInt($(this).attr('data-file-index'));
                        var file = arrFiles[index];
                        console.log(file);
                        currentSizeForAllFiles -= file.size;
                        if (file.hasOwnProperty('removed')) {
                            file.removed = true;
                            oldFiles.push(file);
                        } else {
                            var _index = indexOfPropertyI(newFiles, 'name', file.name, 'size', file.size);
                            if (_index > -1) {
                                newFiles.splice(_index, 1);
                            }
                            arrFiles.splice(index, 1);
                        }
                        listArrFiles();
                    });
                } else {
                    $('body').on('click', 'button.' + elementId + '-btnRemoveFile', function () {
                        var index = parseInt($(this).attr('data-file-index'));
                        var file = arrFiles[index];
                        if (!file.hasOwnProperty('removed')) {
                            currentSizeForAllFiles -= file.size;
                            var _index = indexOfPropertyI(newFiles, 'name', file.name, 'size', file.size);
                            if (_index > -1) {
                                newFiles.splice(_index, 1);
                            }
                            arrFiles.splice(index, 1);
                        }
                        listArrFiles();
                    });
                }
    
                if (_enableDownload) {
                    $('body').on('click', 'a.' + elementId + '-btnDownloadFile', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        window.open($(this).attr('href'), '_blank');
                    });
                } else {
                    $('body').on('click', 'a.' + elementId + '-btnDownloadFile', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    });
                }
    
                // end bind events
                listArrFiles();

                function listArrFiles() {
                    $('#' + elementId + '-table-files-uploaded-body').empty();
                    if (arrFiles.length == 0) {
                        $('#' + elementId + '-hideableTrFile').hide();
                    } else {
                        $('#' + elementId + '-hideableTrFile').show();
                    }
                    for (var i = 0; i < arrFiles.length; i++) {
                        var file = arrFiles[i];
                        if (file.hasOwnProperty('removed')) {
                            if (file.removed) {
                                continue;
                            }
                        }
                        var size = (file.size / 1024 / 1024);
                        var type = "KB";
                        if (size >= 1) {
                            type = "MB"
                        } else {
                            size = (file.size / 1024);
                            type = "KB";
                        }
                        var extension = (file.name.substring(file.name.lastIndexOf("."))).toLowerCase();
                        var style = getStyleByExt(extension);
                        var imgFile = '<i class="fa fa-' + style.classFile + '" style="font-size:50px;color:' + style.colorFile + ';"></i>';
    
                        var btnRemoverArchivo = '';
                        if (_enableRemove && !file.removed) {
                            btnRemoverArchivo = '<button type="button" title="Remover archivo" data-file-index="' + i + '" class="btn btn-danger ' + elementId + '-btnRemoveFile"><i class="fa fa-trash"></i></button>';
                        } else {
                            btnRemoverArchivo = '<button type="button" title="Remover archivo" disabled="disabled" class="btn btn-danger"><i class="fa fa-trash"></i></button>';
                        }
                        var btnDescargarArchivo = '';
                        if (_enableDownload) {
                            if (file.downloadUrl) {
                                btnDescargarArchivo = '<a title="Descargar archivo" href="' + file.downloadUrl + '" class="btn btn-success ' + elementId + '-btnDownloadFile"><i class="fa fa-download"></i></a>';
                            } else {
                                btnDescargarArchivo = '<button type="button" title="Pendiente de subir" disabled="disabled" class="btn btn-primary"><i class="fa fa-upload"></i></button>';
                            }
                        } else {
                            if (file.downloadUrl) {
                                btnDescargarArchivo = '<button type="button" title="Descargar archivo" disabled="disabled" class="btn btn-primary"><i class="fa fa-download"></i></button>';
                            } else {
                                btnDescargarArchivo = '<button type="button" title="Pendiente de subir" disabled="disabled" class="btn btn-primary"><i class="fa fa-upload"></i></button>';
                            }
                        }
    
                        $('#' + elementId + '-table-files-uploaded-body').append(
                            '<tr>\n' +
                                '<td class="td-center">' + imgFile + '</td>\n' +
                                '<td colspan="2">' + file.name + ' (' + size.toFixed(2) + ' ' + type + ')</td>\n' +
                                '<td class="td-center-x2">' + btnDescargarArchivo + '&nbsp;' + btnRemoverArchivo + '</td>\n' +
                            '<tr>\n'
                        );
                    }
    
                    countFiles = arrFiles.length;
                    $('#' + elementId +'-countFiles-inputMultipleFile').text(countFiles);
                    $('input#' + elementId + '-inputFiles[type=file]').val('');
                }
                
                _$this.getArrFiles = function() {
                    return arrFiles;
                }
    
                _$this.getArrOldFiles = function() {
                    return oldFiles;
                }
    
                _$this.getArrNewFiles = function() {
                    return newFiles;
                }

                _$this.destroy = function(){
                    var elementId = $(this).attr("id");
                    for(var i = 0; i < ListInputs.length; i++){
                        if(ListInputs[i].attr("id") == elementId){
                            ListInputs.splice(i, 1); // eliminando instancia
                            // unbind
                            $('button.' + elementId + '-btnRemoveFile').off();
                            $('button.' + elementId + '-btnRemoveFile').unbind();

                            $('a.' + elementId + '-btnDownloadFile').off();
                            $('a.' + elementId + '-btnDownloadFile').unbind();
                            
                            $('#'+ elementId + '-drop-zone-files-uploaded').off();
                            $('#'+ elementId + '-drop-zone-files-uploaded').unbind();

                            // empty html
                            $(this).empty();
                            return;
                        }
                    }
                }

                function addBatchFiles(files) {
                    var countFilesNotAllowedExt = 0;
                    var countFilesNotAllowedSize = 0;
                    var countFilesDuplicates = 0;
                    if (files) {
                        for (var i = 0; i < files.length; i++) {
                            var cfile = files[i];
                            if (isExtFileValid(cfile)) { // verificando que la extensión sea válido
                                if (cfile.size >= maxSizePerFile) { // verificando que el tamaño sea válido
                                    countFilesNotAllowedSize++;
                                } else {
                                    currentSizeForAllFiles += cfile.size;
                                    if (currentSizeForAllFiles < maxSizeForAllFiles) {
                                        if (!exitsFile(cfile)) {
                                            arrFiles.push(cfile);
                                            newFiles.push(cfile);
                                            currentSizeForAllFiles += cfile.size;
                                        } else {
                                            countFilesDuplicates++;
                                        }
                                    } else {
                                        alertMFI('Advertencia', 'El archivo seleccionado supera el limite de tamaño máximo para subir archivos.', 'warning');
                                    }
                                    currentSizeForAllFiles -= cfile.size;
                                }
                            } else {
                                countFilesNotAllowedExt++;
                            }
                        }
    
                        if (countFilesNotAllowedSize == 1) {
                            alertMFI('Advertencia', 'El tamaño máximo de archivos individuales es de 10MB. Un archivo no fue agregado, seleccione archivos con tamaño inferior a 10MB.', 'warning');
                        } else if (countFilesNotAllowedSize > 1) {
                            alertMFI('Advertencia', 'El tamaño máximo de archivos individuales es de 10MB. ' + countFilesNotAllowedSize + ' archivos no fueron agregados, seleccione archivos con tamaño inferior a 10MB.', 'warning');
                        }
                        
                        if (countFilesNotAllowedExt == 1) {
                            alertMFI('Advertencia', 'No se permite la subida de archivos multimedia. Un archivo no fue agregado, seleccione otro tipo de archivo.', 'warning');
                        } else if (countFilesNotAllowedExt > 1) {
                            alertMFI('Advertencia', 'No se permite la subida de archivos multimedia. ' + countFilesNotAllowedExt + ' archivos no fueron agregados, seleccione otro tipo de archivo.', 'warning');
                        }
                        
                        if (countFilesDuplicates == 1) {
                            alertMFI('Advertencia', 'No se permite la subida de archivos duplicados. Un archivo no fue agregado, seleccione archivos con nombre y extensión únicos.', 'warning');
                        } else if (countFilesDuplicates > 1) {
                            alertMFI('Advertencia', 'No se permite la subida de archivos duplicados. ' + countFilesDuplicates + ' archivos no fueron agregados, seleccione archivos con nombre y extensión únicos.', 'warning');
                        }
    
                        listArrFiles();
                    }
                }

                function callbackChange(files) {
                    if (_enableUpload) {
                        if (files) {
                            addBatchFiles(files);
                        } else {
                            $('input#' + elementId + '-inputFiles[type=file]').click();
                        }
                    }
                }

                function exitsFile(file) {
                    for (var i = 0; i < arrFiles.length; i++) {
                        if (arrFiles[i].name == file.name) {
                            return true;
                        }
                    }
                    return false;
                }

                function isExtFileValid(file){
                    var fileName = file.name;
                    var extension = (fileName.substring(fileName.lastIndexOf("."))).toLowerCase() + ',';
                    var index = extsAllow.indexOf(extension);
                    return (index > -1);
                }

                function makeDroppable(elementId) {
                    $('body').on('dragenter', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    var dropBox = $('#' + elementId + '-drop-zone-files-uploaded');
                    dropBox.bind({
                        dragenter: function () {
                            $(this).addClass('dragover');
                            return false;
                        },
                        dragover: function () {
                            return false;
                        },
                        dragleave: function () {
                            $(this).removeClass('dragover');
                            return false;
                        },
                        drop: function (e) {
                            var dt = e.originalEvent.dataTransfer;
                            callbackChange(dt.files);
                            $(this).removeClass('dragover');
                            return false;
                        },
                        click: function () {
                            callbackChange();
                        }
                    });
                }

                ListInputs.push(_$this);

                return _$this;
            }

            function FileInput(size, name, downloadUrl, path, removed) {
                this.size = size;
                this.name = name;
                this.downloadUrl = downloadUrl;
                this.path = path;
                this.removed = removed;
            }

            function StyleTr(classFile, colorFile) {
                this.classFile = classFile;
                this.colorFile = colorFile;
            }

            function initMultipleFileInput(defaultFiles, enableUpload, enableDownload, enableRemove, extsAllow, maxSizePerFile, maxSizeForAllFiles) {
                this.defaultFiles = defaultFiles || [];
                this.enableUpload = (enableUpload === null || enableUpload === undefined ) ? true : enableUpload;
                this.enableDownload = (enableDownload === null || enableDownload === undefined) ? true : enableDownload;
                this.enableRemove = (enableRemove === null || enableRemove === undefined) ? true : enableRemove;
                this.extsAllow = extsAllow || defaultExtsAllow;
                this.maxSizePerFile = maxSizePerFile || 10240; // en KB
                this.maxSizeForAllFiles = maxSizeForAllFiles || 20480; // en KB
            }

            function alertMFI(title, message, type){
                if (isSwal) {
                    swal(title, message, type);
                } else {
                    alert(title + "\n" +  message);
                }
            }            

            function indexOfPropertyI(array, propName1, searchVal1, propName2, searchVal2) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i][propName1] === searchVal1 && array[i][propName2] === searchVal2) {
                        return i;
                    }
                }
                return -1;
            }

            function getStyleByExt(extension) {
                var style = {};
                switch (extension) {
                    case ('.pdf'):
                        style = new StyleTr('file-pdf-o', '#ff3333');
                        break;
                    case ('.doc'):
                    case ('.docx'):
                        style = new StyleTr('file-word-o', '#336eff');
                        break;
                    case ('.ppt'):
                    case ('.pptx'):
                        style = new StyleTr('file-powerpoint-o', '#ff5733');
                        break;
                    case ('.bmp'):
                    case ('.jpg'):
                    case ('.jpeg'):
                    case ('.png'):
                    case ('.gif'):
                    case ('.tif'):
                        style = new StyleTr('file-image-o', '#ffe833');
                        break;
                    case ('.txt'):
                    case ('.rtf'):
                        style = new StyleTr('file-text-o', '#22242a');
                        break;
                    case ('.xls'):
                    case ('.xlsx'):
                        style = new StyleTr('file-excel-o', '#3db906');
                        break;
                    case ('.pub'):
                    case ('.vdx'):
                        style = new StyleTr('file-text-o', '#1eca6f');
                        break;
                    default:
                        style = new StyleTr('file-o', '#22242a');
                        break;
                }
                return style;
            }

            return _multipleFileInput(initialObj);
        }
    })

})(jQuery)