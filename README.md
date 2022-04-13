## 说明

一个基于electron、node-serialport开发的串口通讯代理器，网页轻松访问串口中的数据。连接rfid感应器、电子秤、串口调试、直吹网页web浏览器直接获取等等。

## 前情提示
mac os 12.1

自带python python -V Python 3.8.8

webstorm 2021.3.2

node -v v14.17.5 保持最新即可

npm -v 6.14.14

yarn -v 1.22.11

npm list electron electron@17.4.0  较新

ws@8.5.0

Windows10 Mac下VM虚拟


## 更新计划
- 支持WS server，直接回传给客户端 [✅]
- 目前可以i在Mac等多平台开发调试，但是发布打包只打包Windows exe，毕竟串口通常用于Windows。

## 原理
内置 ws server 直接将串口数据尽数返回websocket client
通过nodejs的http模块开启http服务，接受请求，可以根据请求的参数，调用对应的连接串口函数（目前已经实现连接rfid感应器），
串口函数负责打开串口读取数据，并将数据返回给http请求。
暂时已经写死了rfid，如果有要连接其他的设备，直接修改串口函数即可。


## 截图
<img width="600" alt="image" src="https://user-images.githubusercontent.com/29787967/163120574-0634ff4f-b3b6-4f42-8716-bee52f83887d.png">

<img width="1436" alt="image" src="https://user-images.githubusercontent.com/29787967/163123727-f3518683-9bcc-4ed1-ab50-1e449a03b240.png">

## 安装与使用

### 直接安装打包好的EXE



### 开发


```bash
# 安装
npm install --registry https://registry.npmmirror.com/
# 本地测试
npm start
# 打包（先不用，需要全局依赖）
npm pack
# 打包发布win （使用这个）
npm run dist-win

```


## 本地没有串口硬件怎么办
简单说下思路和用到的软件。具体可以去http://www.pusdn.com/
串口模拟软件创建一对COM2，COM3 - 串口调试软件连接COM2模拟定税发送 - 本软件连接COM3自动接收，并使用ws转发 - 浏览器ws测试连接websocket server

用到的软件（来自互联网）



## 注意事项

- 如果没办法卸载NSI S错误，直接去C盘对应安装位置，删除即可。
- 如果没办法安装，直接先手动删除目录。
- 没法打开串口：可能占用了，或者没权限，或者不存在。关闭重新打开连接试试。
- 文帝websocket连接ws://localhost:9526
- 常用网址和测试工具，详见http://www.pusdn.com




## 功能
+ 写入卡号并返回
js访问 $.ajax('http://localhost:9527/rfid/bind')
访问url参数中第一个代表要读取的串口类别，目前只有rfid感应器，其他电子秤可以扩展实现
第二个参数是要执行的操作
返回rfids的代码

+ 读卡号
js访问 $.ajax('http://localhost:9527/rfid/multi')
返回rfids卡号，以（epc|epc）的形式


## 其他
+ 本代码借鉴 [基于electron的桌面串口工具](https://github.com/PowerDos/electron-serialport)，感谢！
+ 感谢electron和node-serialport项目
