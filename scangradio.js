// 导入fs模块
const fs = require('fs');
// 导入axios模块
const axios = require('axios');

var log = require('single-line-log').stdout;

var data = JSON.parse(fs.readFileSync("./ports.json").toString());

var allURL = [],scaned_num = 0;

var gradios = [];

const middleware = () => {
    scaned_num ++;
    if(scaned_num == allURL.length) {
        console.log(gradios);
        fs.writeFileSync("./result.json",JSON.stringify(gradios));
    }
}
// "auth_required":true
const checkGradio = async (url) => {
    try {
        log(`${scaned_num}/${allURL.length} Getting ${url}`)
        const response = await axios.get(url,{timeout: 5000});
        // 如果响应体中包含gradio字眼，就返回url，否则返回null
        if (response.data.includes('gradio') && !response.data.includes('"auth_required":true')) {
            middleware()
            gradios.push(url)
            // console.log(url);
            return true;
        } else {
            middleware()
            return false;
        }   
    } catch {
        middleware()
        log(`${scaned_num}/${allURL.length} Miss`)
        return false;
    }
}

for (var domain in data) {
    for (const port of data[domain]) {
        allURL.push(`http://${domain}:${port}`);
    }
}

const sleep = (time) => new Promise((resolve) => {
    setTimeout(resolve, time);
})

var cnt = 0;
module.exports =  async () => {
    for (const url of allURL) {
        checkGradio(url)
        cnt ++;
        if(cnt % 100 == 0) {
            cnt = 0
            await sleep(100);
        }
    }
}