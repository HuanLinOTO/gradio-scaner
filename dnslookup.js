"use strict";
const domains = [];

const dns = require('node:dns');
// 定义一个函数，用来异步地解析一个主机名
const resolveAsync = (hostname) => {
  return new Promise((resolve, reject) => {
    dns.resolve(hostname, (err, records) => {
      if (err) {
        reject(err);
    } else {
        resolve(records);
      }
    });
});
};
// 定义一个异步函数，用来遍历0-999的数字，并解析对应的主机名
const scanAsync = async () => {
    // 返回一个promise，表示扫描的过程
  return new Promise(async (resolve, reject) => {
    for (let num = 0; num < 105; num++) {
      // 构造主机名
      let hostname = `region-${num}.seetacloud.com`;
      try {
          // 解析主机名
          let records = await resolveAsync(hostname);
          // 打印结果
        domains.push(hostname);
          console.log(`${hostname}: ${JSON.stringify(records)}`);
    } catch (err) {
        // 忽略错误
        //   console.error(`${hostname}: ${err.message}`);
    }
}
    // 扫描完成后，调用resolve函数
    resolve(domains);
});
};
// 调用异步函数，并等待它完成

// await scanAsync();
// 导出domains数组
module.exports = scanAsync;