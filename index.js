const iconv = require('iconv-lite')
const { exec } = require('child_process')
const path = require('path')
const express = require('express')
const app = express()

let exec_netUser = (callback) => {
    exec('net user', { encoding: "buffer" }, (error, stdout, stderr) => {
        if (error) {
            callback(stderr, null)
        } else {
            callback(null, iconv.decode(stdout, 'CP866'))
        }
    });
}

let usersTable = (callback) => (exec_netUser((err, res) => {
    if (err) {
        console.log(`Error: ${err}`)
    }
    else {
        callback(res
            .slice(res.lastIndexOf('-') + 1)
            .match(/([A-Za-zА-Яа-я0-9_]+)/g)
        )
    }
}))


app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: true }))

app.route('/')
    .get((request, response) => {
        response.render('index', {
            'title': 'Пользователи Windows'
        })
    })

app.route('/users')
    .post((request, response) => {
        let name = request.body.name

        usersTable((userName) => {
            response.render('users', {
                'title': `Пользователь ${name}`,
                'value': userName.indexOf(name),
                'name': name
            })
        })
    })

const external_port = process.argv[2]
app.listen(external_port, () => {
    console.log(`Приложение запущено на http://localhost:${external_port}`)
})
