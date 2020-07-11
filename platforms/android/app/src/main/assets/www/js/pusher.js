Pusher.logToConsole = true;
let APIKEY = '0fc1d0674c91d5d25e69';
let CLUSTER = 'ap1';
var pusher = new Pusher(APIKEY, {
    cluster: CLUSTER
});

var channel = pusher.subscribe('monitoring');
