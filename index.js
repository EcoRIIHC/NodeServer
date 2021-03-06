const http = require('http')
const mysql = require('mysql')
const querystring = require('querystring')

// 数据库配置
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'react_player'
// })

// 创建连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'react_player'
})
// const sql = `SELECT * FROM songs LIMIT ${(page - 1)*pageSize},${pageSize}`
// server配置
const hostname = 'localhost'
const port = 3001
// server监听
const server = http.createServer((req, res) => {
    // 设置CORS允许
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");

    res.setHeader('Content-Type', 'application/json')

    if (req.method.toUpperCase() === 'OPTIONS') {
        res.end(JSON.stringify({}))
    }
    if (req.method.toUpperCase() === 'POST') {
        console.log('start processing POST')
        let postData = ''
        req.on('data', (data) => {
            postData += data
        })
        req.on('end', () => {
            let params = JSON.parse(postData) || ''
            let page = params.page
            let pageSize = params.pageSize

            let result = {}
            const sql = `SELECT * FROM songs LIMIT ${(page - 1)*pageSize},${pageSize}`
            pool.getConnection((err, connection) => {
                if (err) {
                    console.log(err)
                }
                // 使用连接池回调参数查询
                connection.query(sql, (err, resultSet) => {
                    console.log('执行SQL')
                    if (err) {
                        console.log(err)
                    }
                    result.code = 0
                    result.count = pageSize
                    result.playCount = 56899

                    result.data = resultSet
                    writeResult(res, result)
                    // 释放连接池链接
                    console.log('释放链接')
                    connection.release()
                })
            })

        })
    }
})

server.listen(port, hostname, () => {
    console.log(`server is listening ${port} on ${hostname}`)
})

// 返回结果
const writeResult = (res, result) => {
    res.statusCode = 200
    res.write(JSON.stringify(result))
    res.end()
}