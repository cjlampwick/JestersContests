var express = require('express');
var app = express();
const fs = require('fs');

var bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// index page
app.get('/', function (req, res) {
    let rawdata = fs.readFileSync('db/data.json');
    let leaderboardData = JSON.parse(rawdata);

    function comparePoints(a, b) {
        if (a.points > b.points) {
            return -1;
        }
        if (a.points < b.points) {
            return 1;
        }
        return 0;
    }

    Object.keys(leaderboardData.games).forEach((gameKey) => {
        leaderboardData.games[gameKey].items.sort( comparePoints );
    });

    res.render('leaderboard', { leaderboardData });
});

// index page
app.get('/admin', function (req, res) {
    let rawdata = fs.readFileSync('db/data.json');
    let leaderboardData = JSON.parse(rawdata);

    console.log(leaderboardData);

    res.render('adminPanel', { leaderboardData });
});

app.post('/addPlayer', (req, res) => {
    let pfirstName = req.body.firstName;
    let plastName = req.body.lastName;
    let pdni = req.body.dni;
    let pnickname = req.body.nickname;
    let game = req.body.game;

    let rawdata = fs.readFileSync('db/data.json');
    let leaderboardData = JSON.parse(rawdata);

    let response = {
        errorMessage: '',
        status: 'OK'
    }

    let found = leaderboardData.games[game].items.find(({ dni }) => dni === pdni);

    if (found) {
        response.errorMessage = 'Ya existe un jugador con ese DNI';
        response.status = 'ERROR';
    } else {
        leaderboardData.games[game].items.push({
            firstName: pfirstName,
            lastName: plastName,
            dni: pdni,
            nickname: pnickname,
            points: 0,
        });

        let data = JSON.stringify(leaderboardData);
        fs.writeFileSync('db/data.json', data);
    }

    console.info(leaderboardData)

    res.json(response);
});

app.post('/updatePlayers', (req, res) => {
    let items = req.body.items;
    let game = req.body.game;

    let response = {
        errorMessage: '',
        status: 'OK'
    }

    try {
        let rawdata = fs.readFileSync('db/data.json');
        let leaderboardData = JSON.parse(rawdata);

        leaderboardData.games[game].items = items;

        let data = JSON.stringify(leaderboardData);
        fs.writeFileSync('db/data.json', data);

    } catch (ex) {
        response.errorMessage = ex.message;
        response.status = 'ERROR';
    }

    res.json(response);
});

app.get('/getPlayers', (req, res) => {
    console.info(req.query);
    let game = req.query.game;

    let response = {
        errorMessage: '',
        status: 'OK'
    }

    try {
        let rawdata = fs.readFileSync('db/data.json');
        let leaderboardData = JSON.parse(rawdata);

        let sortedItems = leaderboardData.games[game].items;

        function comparePoints(a, b) {
            if (a.points > b.points) {
                return -1;
            }
            if (a.points < b.points) {
                return 1;
            }
            return 0;
        }

        // Sorting
        sortedItems = sortedItems.sort(comparePoints);

        response.items = sortedItems;
    } catch (ex) {
        response = {
            errorMessage: ex.message,
            status: 'ERROR'
        }
        console.info(ex);
    }

    res.json(response);
});

app.listen(8080);
console.log('Server is listening on port 8080');