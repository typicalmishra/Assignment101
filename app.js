const express = require("express");
//FOR RENDERING HTML FILE
const path = require("path")
const fetch = require('node-fetch');
//FOR GETTING INPUT FROM HTML FORM
const bodyParser = require('body-parser');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const API_TOKEN = process.env.API_TOKEN;
const LIST_ID = process.env.LIST_ID;
//FOR USING CSS 
app.use("/static", express.static("static"))

//MIDDLEWARE TO READ INPUT FROM HTML FORMS
app.use(bodyParser.urlencoded({
    extended: true
}));

//MAIN GET ROUTE
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'));
});

router.post('/', (req, res) => {
    let { name, description, startDateInput, dueDateInput } = req.body;
    if (!name || !description || !startDateInput || !dueDateInput) {
        res.status(400).end(htmlCodeForError(400, "Invalid Input"));
    } else if (startDateInput > dueDateInput) {
        res.status(400).end(htmlCodeForError(400, "Start date must be earlier than due date"));
    } else {
        let payload = {
            "key": API_KEY,
            "token": API_TOKEN,
            "name": name,
            "desc": description,
            "pos": "top",
            "due": dueDateInput,
            "start": startDateInput,
            "idList": LIST_ID
        };
        createCard(payload);
        res.redirect('back');
    }
})


//THIS FUNCTION WILL PLACE A POST REQUEST ON TRELLO AND WILL CREATE A CARD ON TRELLO BOARD
function createCard(payload) {
    fetch('https://api.trello.com/1/cards', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            );
            return response.text();
        })
        .then(text => text)
        .catch(err => err);

}

//THIS FUNCTION IS USED FOR DISPLAYING ERROR IN THE FRONT END
function htmlCodeForError(statusCode, errorMessage) {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Assignment</title>
      </head>
      <body>
        <p>Status Code : ${statusCode}. ${errorMessage}</p>
        <a href="http://127.0.0.1:${PORT}/">Back To The Website!!</a>
      </body>
    </html>`;
}

app.use('/', router);
app.listen(PORT, () => {
    console.log("Running at port " + PORT);
});
