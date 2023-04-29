// 导入child_process模块
const { spawn } = require('child_process');
// 导入fs模块
const fs = require('fs');
// 导入xml2js模块
const xml2js = require('xml2js');
// 创建一个xml解析器
const parser = new xml2js.Parser();
// 创建一个xml构建器
const builder = new xml2js.Builder();
// 定义一个数组代表要扫描的域名
// const domains = ['baidu.com', 'google.com', 'csdn.net'];
const get_domains = require("./dnslookup.js");
const scangradio = require('./scangradio.js');
const ports = {};

var domains;

const saveAll = () => {
  if (Object.keys(ports).length === domains.length) {
    fs.writeFile(`ports.json`, JSON.stringify(ports), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Saved ports.json`);
        scangradio();
      }
    });
  }
}

(async () => {
  domains = await get_domains();
  var scaned_domain = 0;
  console.log(domains);
  // 定义一个对象用于存储所有的端口数组
  // 遍历要扫描的域名数组，对每个域名创建一个子进程并执行nmap命令
  for (let domain of domains) {
    // 创建一个子进程并执行nmap命令，扫描所有tcp端口，并将结果保存为xml格式
    const child = spawn('nmap', ['-p-', '-Pn', '-oX', `${domain}.xml`, domain]);
    var isTimeout = false;
    let timeoutCleaner = setTimeout(() => {
      isTimeout = true;
      console.log(domain, "Timeout!");
      child.kill();
    }, 150 * 1000)
    // 监听子进程的标准输出流，并打印到控制台
    child.stdout.on('data', (data) => {
      if (data.length > 130) return;
      console.log(`stdout[${domain}]: ${data}`);
    });
    // 监听子进程的标准错误流，并打印到控制台
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    // 监听子进程的退出事件，并打印退出码和信号
    child.on('close', (code, signal) => {
      scaned_domain++;
      console.log(`child process exited with code ${code} and signal ${signal} ${scaned_domain}/${domains.length}`);
      if (isTimeout) {
        ports[domain] = [];
        if(scaned_domain == domains.length) {
          saveAll();
        }
        return;
      } else {
        clearTimeout(timeoutCleaner);
      }
      // 如果子进程正常退出，读取xml文件并转换为json对象
      if (code === 0) {
        fs.readFile(`${domain}.xml`, (err, data) => {
          if (err) {
            console.error(err);
          } else {
            parser.parseString(data, (err, result) => {
              if (err) {
                console.error(err);
              } else {
                // 提取出端口的信息，并存储到ports对象中，以域名为键，端口数组为值
                const portInfo = result.nmaprun.host[0].ports[0].port;
                const portArray = portInfo.map((item) => item.$.portid);
                ports[domain] = portArray;
                console.log(domain, "Scaned");
                // 如果所有域名都扫描完成，将ports对象转换为字符串并写入json文件
                saveAll();
              }
            });
          }
        });
      }
    });
  }
})()
