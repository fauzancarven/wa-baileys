$(document).ready(function() {
    var table = $('#tbl-device').DataTable({
        "searching": false,
        "lengthChange": false, 
        "pageLength": parseInt(10), 
        "ajax": {
            "url": "/datatable/device",
            "type": "POST", 
            "data": function(data){ 
                data["search"] =  $("#searchdatasph").val();  
            }
        }, 
        "initComplete": function(settings, json) {
            //tooltiprenew();
        },
        "columns": [  
            { width: "30px",
                "data": null,
                "render": function(data, type, row, meta) {
                    return meta.row + 1;
                }
            }, 
            { data: "Name",   }, 
            { data: "Number", className:"text-start",},   
            { data: "Status",   
                render: function(data, type, row,meta) { 
                    if(row["Status"] === 0){
                        return `<label class="form-check-label line-height-1 fw-medium text-secondary-light text-sm d-flex align-items-center gap-1" for="Holiday"><span class="w-8-px h-8-px bg-danger-600 rounded-circle"></span>Disconnect</label>`; 
                    }else{ 
                        return `<label class="form-check-label line-height-1 fw-medium text-secondary-light text-sm d-flex align-items-center gap-1" for="Holiday"><span class="w-8-px h-8-px bg-success-600 rounded-circle"></span>Connected</label>`; 
                    } 
                }
            },  
            { data: null,  className:"align-top",
                render: function(data, type, row,meta) {  
                    return `<div class="d-flex align-items-center gap-10 justify-content-center">
                    <button type="button" class="btn btn-outline-primary text-sm btn-sm px-10 py-10  radius-8 d-flex align-items-center gap-2 ${(row["Status"] === 1 ? "d-none" : "")}" onclick="scanwhatsapp('${row["Number"]}')"> 
                        <iconify-icon icon="material-symbols:link" class="icon text-xl"></iconify-icon>
                        <span>Connect Device</span>
                    </button>
                    <button type="button" class="btn btn-outline-primary text-sm btn-sm px-10 py-10  radius-8 d-flex align-items-center gap-1 ${(row["Status"] === 0 ? "d-none" : "")}" onclick="gettoken('${row["Number"]}')"> 
                        <iconify-icon icon="material-symbols:key-vertical" class="icon text-xl"></iconify-icon>
                        <span >Token</span>
                    </button>
                    <button type="button" class="bg-warning-focus text-warning-600 bg-hover-warning-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="editdevice('${row["Number"]}')">
                        <iconify-icon icon="lucide:edit" class="menu-icon"></iconify-icon>
                    </button>
                    <button type="button" class="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" onclick="deletedevice('${row["Number"]}')">
                        <iconify-icon icon="fluent:delete-24-regular" class="menu-icon"></iconify-icon>
                    </button>
                </div>`;
                }
            },  
        ] 
    }); 

    scanwhatsapp = function(number){
        $("#modal-scan-label").text("Scan Qr ("+number+")")
        $("#modal-scan").modal("show"); 
        $("#loading-qr").show();

        $('#pills-tab button').on('shown.bs.tab', function (e) {
            if( $(e.target).data("value") === "qr"){ 
                console.log("tab QR",number);
                $("#loading-qr").show();
                socket.emit("new-device", {number: number,type: false});
            }else{
                console.log("tab Pairing code",number)
                socket.emit("new-device", {number: number,type: true}); 
            } 
        }); 
        $('#modal-scan').on('hidden.bs.modal', function () {
            $('#pills-tab button').off('shown.bs.tab');
            table.ajax.reload();
        });
        $('#pills-button-qr-tab').tab('show').trigger('shown.bs.tab'); 
        socket.on('whatsapp-qr', (data) => {
            if(data.status === "qr" && data.number === number){
                $("#modal-scan-img").attr("src",data.reason);
                $("#loading-qr").hide();
            }
            console.log('Data whatsapp-qr dari server:', data);
        });  
        socket.on('whatsapp-pairing', (data) => {
            if(data.status === "success" && data.number === number){ 
                console.log("Code : ",data.reason) 
                $("#loading-code").hide();
                const string = data.reason;
                const divs = document.querySelectorAll('.box-code');

                string.split('').forEach((char, index) => {
                    divs[index].textContent = char;
                });
            } else{ 
                console.log("Error : ",data.reason) 
            }
            console.log('Data whatsapp-pairing dari server:', data);
        }); 



        socket.on('whatsapp-status', (data) => {
            if(data.status === "open" && data.number === number){
                $("#modal-scan").modal("hide"); 
            }
            console.log('Data whatsapp-status dari server:', data);
        }); 
        
    }

    $("#btn-submit-add").on("click",function(){ 
        if($("#txt-add-name").val() == ""){
            Swal.fire({
                icon: 'error',
                text: 'Nama Whatsapp harus diisi...!!!', 
                confirmButtonColor: "#3085d6", 
            }).then(function(){ 
                swal.close();
                setTimeout(() =>  $("#txt-add-name").focus(), 300);  
            });
            return  false;
        }
        if($("#txt-add-number").val() == ""){  
            Swal.fire({
                icon: 'error',
                text: 'Nomer Whatsapp harus diisi...!!!', 
                confirmButtonColor: "#3085d6", 
            }).then(function(){ 
                swal.close();
                setTimeout(() =>  $("#txt-add-name").focus(), 300);  
            });
            return  false; 
        } 
    });
});