const iconv = require('iconv-lite')
const { exec } = require('child_process')
const path = require('path')
const express = require('express')
const app = express()

let getUset_Exec = (callback) => {
    exec('net user', { encoding: "buffer" }, (error, stdout, stderr) => {
        if (error) {
            callback(stderr, null)
        } else {
            callback(null, iconv.decode(stdout, 'CP866'))
        }
    });
}

// https://cs4.pikabu.ru/post_img/big/2014/12/19/10/1419005128_596027900.jpg
let getUsers = (callback) => {
    getUset_Exec((error, resource) => {
        if (!error) {
            let buff = ''

            buff = resource.slice(resource.indexOf('WDAGUtilityAccount') + 'WDAGUtilityAccount'.length)
            buff = buff.replace(/\s+/g, ' ').trim()
            buff = buff.slice(0, buff.indexOf(' The command completed successfully.'))

            buff = buff.split(" ")

            for (let i = 1; i < buff.length; i += 2) {
                delete buff[i]
            }

            buff = buff.filter((f) => { return f !== null })

            callback(buff)
        }
    })
}

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

        getUsers((userName) => {
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