/**
 * 小程序配置文件
 */
var host = "https://pingshif.applinzi.com/"
var apiUrl = "https://pingshif.applinzi.com/api"
// var host = "http://2.pingshif.applinzi.com/"
// var apiUrl = "http://2.pingshif.applinzi.com/api"
// var host = "http://127.0.0.1/pingshifen"
// var apiUrl = "http://127.0.0.1/pingshifen/index.php/Api/Gateway/route"
var config = {
    // 下面的地址配合云端 Server 工作
    host,
    apiUrl,
    imgUploadUrl: `${host}/index.php/Api/Img/uploadOne`,
    // 登录地址，用于建立会话
    loginUrl: `${host}/index.php/Api/Weixin/login`,
    // check check_3rdsession地址，用于验证
    check3RdUrl: `${host}/index.php/Api/Weixin/check_3rdsession`,
    getUserTelUrl: `${host}/index.php/Api/Weixin/get_user_tel`,
    setSessionUrl:   `${host}/index.php/Api/Weixin/setOpenid`
};

module.exports = config
