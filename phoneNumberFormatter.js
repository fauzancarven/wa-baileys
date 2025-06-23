const phoneNumberFormatter = function(number,suffic = true) {
    // 1. Menghilangkan karakter selain angka
    let formatted = number.replace(/\D/g, '');
  
    // 2. Menghilangkan angka 0 di depan (prefix)
    //    Kemudian diganti dengan 62
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substr(1);
    }
    if(suffic){
      if (!formatted.endsWith('@s.whatsapp.net')) {
        formatted += '@s.whatsapp.net';
      }  
    }
    return formatted;
  } 
  module.exports = {
    phoneNumberFormatter 
  } 
  