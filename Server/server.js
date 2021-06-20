// mongodb+srv://x_117:<password>@cluster0.0u6lv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const axios = require('axios')


const UserSchema = new mongoose.Schema({
  firstName : {type: String, required : true},
  lastName : {type: String, required : true},
  email : {type: String, required : true, unique : true},
  phoneNumber : {type: String, required : true, unique : true},
  password : {type: String, required : true},
  vaccinated : {type: String, required : true},
  hospitalName : {type: String, required : true},
  hospitalId : {type: String, required : true}
})
const User = mongoose.model('UserSchema', UserSchema)


app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html')
})
app.post('/', (req, res) => {
    console.log(req.body)
})


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})
app.post('/login', (req, res) => {
    console.log(req.body)
    var username = req.body.username
    var password = req.body.password
    console.log(password)
    User.findOne({$or: [{email:username}, {phoneNumber:username}]})
    .then(async user => {
        if(user){
            if (await bcrypt.compare(password, user.password)){
                res.send("Logged In!")
            }
            else{
                res.redirect('/login')
            }
        }
        else{
            res.redirect('/registration')
        }
    })
    // res.send("Logged In!")
})


app.get('/registration', (req, res) => {
    res.sendFile(__dirname + '/registration.html')
})
app.post('/registration', (req, res) => {
    User.findOne({$or: [{email:req.body.email}, {phoneNumber:req.body.phoneNumber}]})
    .then(async user => {
        if(user){
            res.send("User Exists!")
        }
        else{
            var hashedPass = await bcrypt.hash(req.body.password, 10)
            var user = new User({
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                email : req.body.email,
                phoneNumber : req.body.phoneNumber,
                password : hashedPass,
                vaccinated : "No",
                hospitalName : "Something",
                hospitalId : "0"
            })
            user.save()
            res.send("Registered!")
        }
    })
})


app.post('/mainPage', (req, res) => {
    lat = req.body.lat
    long = req.body.long
    date = req.body.date
    username = req.body.username
    /*lat = 22.546014
    long = 88.307579
    date = '19-06-2021'*/
    findCenter = "https://cdn-api.co-vin.in/api/v2/appointment/centers/public/findByLatLong?lat=" + lat + "&long=" + long
    hospitalName = "Something"
    hospitalId = 0
    axios.get(findCenter)
    .then((response) => {
            centers = response.data.centers.map((content, index) => {
            return response.data.centers[index].center_id
            })
            for (i=0; i<centers.length; i++){
                findVac = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByCenter?center_id=' + centers[i] + '&date=' + date
                axios.get(findVac).then(async (resp) => {
                    try{
                        shit = resp.data.centers
                        // console.log(shit.sessions[0].available_capacity)
                        if (shit.sessions[0].available_capacity > 0){
                            hospitalName = shit.name
                            hospitalId = shit.center_id
                            // console.log(hospitalId, hospitalName)
                            let doc = await User.findOne({email : username})
                            if (doc.vaccinated == "No"){
                                doc.hospitalName = hospitalName
                                doc.hospitalId = hospitalId
                                await doc.save()
                                res.send("Assigned!")
                            }
                            else{
                                res.send("Vaccinated!")
                            }
                            return
                        }
                        else{
                            console.log("No vaccines")
                        }
                    }
                    catch(e){
                        console.log("Error")
                    }
                })
                /*if (hospitalId != 0){
                    // console.log(hospitalId, hospitalName)
                    break;
                }*/
            }
        })
        .catch((error) => {console.log(error)})
    })
    .on("error", (err) => {
        console.log(err)
})
    // console.log(response)
    // availability = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByCenter?center_id=' + centerId + '&date=' + date




app.post('/redirects', (req, res) => {
    shit = req.body.variable
    console.log(shit)
    if (shit == "login"){
        res.redirect('/login')
    }
    else if (shit == "register"){
        res.redirect('/registration')
    }
})


mongoose.connect('mongodb+srv://x_117:JAbPuF8g5zCD1pwX@cluster0.0u6lv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true} ).then((response) => {
    console.log("Connected!!")
    app.listen(3000)
}).catch((error) => {
    console.log(error)
})


// https://cdn-api.co-vin.in/api/v2/appointment/centers/public/findByLatLong?lat=22.54&long=88.30
// https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByCenter?center_id=1234&date=31-03-2021
// 22.546014, 88.307579