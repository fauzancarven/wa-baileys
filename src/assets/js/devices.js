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
                    <button type="button" class="btn btn-outline-primary text-sm btn-sm px-10 py-10  radius-8 d-flex align-items-center gap-2" onclick="scanwhatsapp('${row["Number"]}')"> 
                        <iconify-icon icon="material-symbols:link" class="icon text-xl"></iconify-icon>
                        <span>Connect Device</span>
                    </button>
                    <button type="button" class="btn btn-outline-primary text-sm btn-sm px-10 py-10  radius-8 d-flex align-items-center gap-1"> 
                        <iconify-icon icon="material-symbols:key-vertical" class="icon text-xl"></iconify-icon>
                        <span>Token</span>
                    </button>
                    <button type="button" class="bg-warning-focus text-warning-600 bg-hover-warning-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"> 
                        <iconify-icon icon="lucide:edit" class="menu-icon"></iconify-icon>
                    </button>
                    <button type="button" class="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"> 
                        <iconify-icon icon="fluent:delete-24-regular" class="menu-icon"></iconify-icon>
                    </button>
                </div>`;
                }
            },  
        ] 
    }); 
    const socket = io();  
    socket.emit("load-device", 'Halo server!'); 

    scanwhatsapp = function(number){
        $("#modal-scan-label").text("Scan Qr ("+number+")")
        $("#modal-scan").modal("show"); 
        $('#pills-button-qr-tab').trigger('click');
        $("#loading-qr").show();

        socket.emit("new-device", {number: number,type: false});

        socket.on('whatsapp-qr', (data) => {
            if(data.status === "qr" && data.number === number){
                $("#modal-scan-img").attr("src",data.reason);
                $("#loading-qr").hide();
            }
            console.log('Data whatsapp-qr dari server:', data);
        }); 
        
        socket.on('whatsapp-pairing', (data) => {
            console.log('Data whatsapp-pairing dari server:', data);
        }); 
        socket.on('whatsapp-status', (data) => {
            if(data.status === "open" && data.number === number){
                $("#modal-scan").modal("hide"); 
                table.ajax.reload();
            }
            console.log('Data whatsapp-status dari server:', data);
        }); 
        
    }
});