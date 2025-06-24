# Express.js Basic Login
Learn basic login using NodeJS with the Express.js Framework and the EJS template engine that is connected to a MySQL database

Tutorial : https://dazelpro.com/article/membuat-basic-login-dan-register-menggunakan-nodejs

# How to run
* Clone this repository
* Import database.sql to your server in name `db_node_login`
* Run `npm install`
* And run `npm run start`
* See the results in the browser `http://localhost:2000`


# panduan kirim wa  
# jquery form data =========================================

var form = new FormData();
form.append("message", "oke");
form.append("number", "081252053793");
form.append("sender", "081252053793");
form.append("file_dikirim", fileInput.files[0], "/C:/Users/Nusantara/Documents/Laporan Buku Tamu Tanggal 01-9-2022.pdf");

* var settings = {
*  "url": "http://localhost:2000/send-message",
*  "method": "POST",
*  "timeout": 0,
*  "processData": false,
*  "mimeType": "multipart/form-data",
*  "contentType": false,
*  "data": form
* };

* $.ajax(settings).done(function (response) {
*   console.log(response);
* });
 
# PHP Curl =========================================

<?php

* $curl = curl_init();

* curl_setopt_array($curl, array(
*  CURLOPT_URL => 'http://localhost:2000/send-message',
*  CURLOPT_RETURNTRANSFER => true,
*  CURLOPT_ENCODING => '',
*  CURLOPT_MAXREDIRS => 10,
*  CURLOPT_TIMEOUT => 0,
*  CURLOPT_FOLLOWLOCATION => true,
*  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
*  CURLOPT_CUSTOMREQUEST => 'POST',
*  CURLOPT_POSTFIELDS => array('message' => 'oke','sender' => '081252053793','number' => '081252053793','file_dikirim'=> new CURLFILE('/C:/Users/Nusantara/Documents/Laporan Buku Tamu Tanggal 01-9-2022.pdf')),
* ));

* $response = curl_exec($curl);

* curl_close($curl);
* echo $response; 

# javascript XHR =========================================
# WARNING: For POST requests, body is set to null by browsers.
var data = new FormData();
data.append("message", "oke");
data.append("number", "081252053793");
data.append("sender", "081252053793");
data.append("file_dikirim", fileInput.files[0], "/path/to/file");
 
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://localhost:2000/send-message");

xhr.send(data);
 

