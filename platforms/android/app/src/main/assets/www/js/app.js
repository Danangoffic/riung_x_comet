     var url = "http://app.riungmitra.co.id/monitoring/index.php/";
//  var url = "http://192.168.43.71/monitoring/index.php/";
// var url = "http://192.168.2.7/monitoring/index.php/";
var storage = window.localStorage;
if(storage.getItem("statusLogin") == "" || storage.getItem("statusLogin") == null){
    storage.setItem("statusLogin", 0);
}
if(storage.getItem("userLogin") == "" || storage.getItem("userLogin") == null){
    storage.setItem("userLogin", "");
}
if(storage.getItem("userType") == "" || storage.getItem("userType") == null){
    storage.setItem("userType", 0);
}
var statusLogin = storage.getItem("statusLogin"), userLogin = storage.getItem("userLogin"), userType = storage.getItem("userType"); 