function getIp(){
    var ip = "";
    var url = "http://ip.jsontest.com/";
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: function(data){
            ip = data.ip;
        }
    });
    return ip;
}