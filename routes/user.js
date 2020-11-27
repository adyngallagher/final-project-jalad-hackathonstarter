const express = require('express');
const User = require('../models/User.js');
const router = express.Router();

// function to count the number of attributes in an object
function objLength(obj){
  var count = 0;
  for(var key in obj){
    count = count + 1;
  }
  return count;
}

/* 
USER ROUTES
*/

// get all of the users in the database
router.get('/', function(req, res, next) {
  User.find(function (err, users) {
    res.send(users);
  });
});

// get one specific user in the database by username
router.get('/:username', function(req, res, next) {

  var username = req.params.username;
  User.findOne({username: username}, function(err, user){
    if(err) {
      console.log(err);
      res.status(500).send("error getting user by ID");
      return;
    }
    else if(!user){
      res.status(404).send("No users found");
      return;
    }
    res.send(user);
  })

})

// post a new user
router.post('/', function(req, res, next) {

  // if req.body does not have four attributes or the attribute names do not match
  // the expected formate, throw a 400
  if(objLength(req.body) !== 4){
    console.log("wrong object length");
    res.status(400).send("Invalid JSON format.");
    return;
  }
  else if(!req.body.username || !req.body.name || !req.body.bio || !req.body.birthday){
    console.log("wrong parameters");
    res.status(400).send("Invalid JSON format.");
    return;
  }

  // create and save new user with req.body
  let user = new User(req.body);
  user.save((err, result) => {

    // non-unique username would cause an error
    if(err){
      console.log("Username is taken");
      res.status(400).send("Username is taken");
      return;
    }
    res.status(201).send();

  })

})

router.put('/:username', function(req, res, next) {

  let username = req.params.username;

  // find user by username
  User.findOne({username: username}, function(err, user) {

    if(err){
      console.log(err);
      res.status(500).send("error updating user by username");
      return;
    }
    else if(!user){
      
      // user does not exist, so create user
      req.body.username = req.params.username;

      // if req.body does not have four attributes or the attribute names do not match
      // the expected formate, throw a 400
      if(objLength(req.body) !== 4){
        console.log("wrong object length");
        res.status(400).send("Invalid JSON format.");
        return;
      }
      else if(!req.body.username || !req.body.name || !req.body.bio || !req.body.birthday){
        console.log("wrong parameters");
        res.status(400).send("Invalid JSON format.");
        return;
      }

      let newUser = new User(req.body);
      newUser.save((err, result) => {

        // non-unique username would cause an error
        if(err){
          console.log(err);
          res.status(400).send("Username is taken");
          return;
        }
        res.status(201).send();

      })

    }

  })

  // for each paramater that exists, update user
  if(req.body.name){

    User.updateOne({username: username}, {name: req.body.name}, function(err, user){
      if(err){
        console.log(err);
        res.status(500).send("error updating user");
        return;
      }
    })

  }
  if(req.body.bio){

    User.updateOne({username: username}, {bio: req.body.bio}, function(err, user){
      if(err){
        console.log(err);
        res.status(500).send("error updating user");
        return;
      }
    })

  }
  if(req.body.birthday){

    User.updateOne({username: username}, {birthday: req.body.birthday}, function(err, user){
      if(err){
        console.log(err);
        res.status(500).send("error updating user");
        return;
      }
    })

  }
  //need to check to see if there was any update otherwise empty body would send
  res.status(201).send();

})

// delete a user by username
router.delete('/:username', function(req, res, next) {

  // search for the user with the paramater id, and delete it
  User.deleteOne({username: req.params.username}, function(err, deleted){
    if(err){
      console.log(err);
      res.status(500).send("error deleting");
      return;
    }

    // if the user does not exist, throw a 404
    else if(deleted.deletedCount === 0){
      res.status(404).send("User does not exist");
      return;
    }
    res.status(200).send(); 
  })

})

/*
MOOD ROUTES
*/


/**
 * GET - /users/[username]/moods
 * Return a JSON listing of all moods from the user identified by [username].
 */
router.get('/:username/moods', function(req, res, next) {
  let username = req.params.username;

  User.findOne({username: username}, function(err, user) {
      if (err)  console.log(err);

      //if user does not exist
      if (!user) {
        let message = "User with username " + username + " does not exist.";
        console.log(message);
        res.status(404).send(message);
        return;
      }

      //store moods in an array
      let moodsArray = user.moods;

      // if there are no moods stored
      if (!(moodsArray.length > 0)) {
        let message = "No moods for user with username " + username;
        console.log(message);
        res.send(message);
        return;
      }

      //if there is a search query
      if (req.query.search) { //check for search query
        let query = req.query.search; //req.query.search.toLowerCase();
        console.log("Search query: " + query);

        //check query for invalid value
        let validMoods = ['Sad', 'Okay', 'Happy', 'Anxious', 'Mad'];
        if (!(validMoods.includes(query))) {
          let message = "Invalid search value of " + query;
          console.log(message);
          res.status(404).send(message);
          return;
        }

        //find moods that match query
        let searchedMoods = moodsArray.filter(mood =>
          (mood.general_mood == query));
            //(mood.generalMood.toLowerCase().includes(query) || review.body.toLowerCase().includes(query)));
        res.send(searchedMoods); //return JSON list of moods that were found
        return;
      }

      //return JSON arry of moods
      res.send(moodsArray);
  });
});

/**
 * GET - /users/[username]/moods/[mood_id]
 * This should return in JSON the mood on this user identified by mood ID.
 * If no such mood exists, it should return a 404
 */
router.get('/:username/moods/:mood_id', function(req, res, next) {
  let username = req.params.username;
  let mood_id = req.params.mood_id;

  User.findOne({username: username}, function (err, user) {
      if(err) console.log(err);

      //if user does not exist
      if (!user) {
        let message = "User with username " + username + " does not exist.";
        console.log(message);
        res.status(404).send(message);
        return;
      }

      //store moods in an array
      let moodsArray = user.moods;

      // if there are no moods stored
      if (!(moodsArray.length > 0)) {
        let message = "No moods for user with username " + username;
        console.log(message);
        res.send(message);
        return;
      }

      //find mood that matches /:mood_id
      let moodFound = moodsArray.filter(mood => (mood.mood_id == mood_id));
      if (!(moodFound.length > 0)) {
        let message = "Mood with id " + mood_id + " does not exist for user " + username;
        console.log(message);
        res.status(404).send(message);
        return;
      }

      //return JSON of mood with mood_id
      res.send(moodFound);
  });
});

 /**
 * POST - /users/[username]/moods
 * This should accept a JSON body and create a mood element in the moods 
 *    collection of the user identified by [mood_id].
 * ID and DATE should be created server side (ID should be a number)
 * Any invalid data upload (missing fields) should return a 400 error
 * The only field that has to be unique is mood ID
 */
router.post('/:username/moods', function(req, res, next) { 

  //if req.body does not have expected format, send 400
  if(objLength(req.body) !== 2){
    console.log("wrong object length");
    res.status(400).send("Invalid JSON format.");
    return;
  }
  else if(!req.body.general_mood || !req.body.description){
    console.log("wrong parameters");
    res.status(400).send("Invalid JSON format.");
    return;
  }
  //check for valid mood input   
  let validMoods = ['Sad', 'Okay', 'Happy', 'Anxious', 'Mad'];
  if (!(validMoods.includes(req.body.general_mood))) {
    let message = "Invalid mood";
    console.log(message);
    res.status(404).send(message);
    return;
  }
  postNewMood(req.params.username, -1, req, res);
});

 /**
  * PUT - /users/[username]/moods/[mood_id]
  * This should accept a JSON body and update the mood identified by [mood_id].
  * If this mood does not exist, it should create it.
  */
 router.put('/:username/moods/:mood_id', function(req, res, next) {
  let username = req.params.username;
  let mood_id = req.params.mood_id;

  User.findOne({username: username}, function(err, user) {
      if (err) console.log(err);

      //if user does not exist
      if (!user) {
        let message = "User with username " + username + " does not exist.";
        console.log(message);
        res.status(404).send(message);
        return;
      }

      let moodsArray = user.moods;

      //if there are no moods, create new mood with given id
      if (!(moodsArray.length > 0)) {
        postNewMood(username, mood_id, req, res);
        return;
      }
      let moodIndex = moodsArray.findIndex(mood => mood.mood_id == mood_id);

      //if mood id isn't found, create new mood with given id
      if (moodIndex === -1) {
        postNewMood(username, mood_id, req, res);
        return;
      }

      //update params that are present in req.body at index in mood array
      if (req.body.general_mood) {
        //check for valid mood input   
        let validMoods = ['Sad', 'Okay', 'Happy', 'Anxious', 'Mad'];
        if (!(validMoods.includes(req.body.general_mood))) {
          let message = "Invalid mood";
          console.log(message);
          res.status(404).send(message);
          return;
        }
        moodsArray[moodIndex].general_mood = req.body.general_mood;
      }
      if (req.body.description) {
        moodsArray[moodIndex].description = req.body.description;
      }

      //update User with new moods array
      User.updateOne({username: username}, {moods: moodsArray}, function(err, newUser) {
        if (err)  console.log(err);
        res.status(200).send();
      });
  });
});

/**
 * DELETE - /users/[username]/moods/[mood_id]
 * This should delete the mood.
 * Return 404 if no such mood exists.
 */
router.delete('/:username/moods/:mood_id', function(req, res, next) {
  let username = req.params.username;
  let mood_id = req.params.mood_id;

  User.findOne({username: username}, function (err, user) {
      if(err) console.log(err);

      //if user does not exist
      if (!user) {
        let message = "User with username " + username + " does not exist.";
        console.log(message);
        res.status(404).send(message);
        return;
      }

      //store moods in an array
      let moodsArray = user.moods;

      // if there are no moods, send 404
      if (!(moodsArray.length > 0)) {
        let message = "No moods for user with username " + username;
        console.log(message);
        res.status(404).send(message);
        return;
      }

      //find mood index of mood that matches /:mood_id
      let moodIndex = moodsArray.findIndex(mood => (mood.mood_id == mood_id));
      //if there is no mood with mood_id, send 404
      if (moodIndex === -1) {
        let message = "Mood with id " + mood_id + " does not exist for user " + username;
        console.log(message);
        res.status(404).send(message);
        return;
      }

      //delete element from mood array and update user
      moodsArray.splice(moodIndex, 1);
      User.updateOne({username: username}, {moods: moodsArray}, function(err, newUser) {
          if (err)  console.log(err);
          res.status(200).send();
      });
  });
});

function postNewMood(username, mood_id, req, res) {
  User.findOne({username: username}, function(err, user) {
      if (err)  console.log(err);

      //if user does not exist
      if (!user) {
        let message = "User with username " + username + " does not exist.";
        console.log(message);
        res.status(404).send(message);
        return;
      }

      let moodArray = user.moods;

      //find next id if mood_id is not specified
      if (mood_id == -1) {
          let maxId = 0;
          if (moodArray.length > 0) {
              maxId = (moodArray).reduce((max, mood) =>
                  (mood.mood_id > max ? mood.mood_id : max), 0);
          }
          mood_id = maxId + 1;
      }

      //create new Mood and push to moods array
      let newMood = {mood_id: mood_id, general_mood: req.body.general_mood, description: req.body.description};
      user.moods.push(newMood);

      //update User
      User.updateOne({username: username}, {moods: user.moods}, function(err, newUser) {
          if (err)  console.log(err);
          res.status(200).send();
      });
  });
}

/*
GRATTY ROUTES
*/

/* POST a gratty */
router.post(('/:username/gratties'), function(req, res, next) {
  /* find review with appropriate film_id */
   let username = req.params.username;
   /* make sure input is correct */

   User.findOne( {username: username}, (err,user)=>{
     if (user) {
       /* check req input */
       if (!req.body.description) {
         console.log('Invalid gratty input');
         res.status(404).send();
         return;
       }
       /* generate gratty ID by finding current max gratty ID */
       let max = 0;
       user.gratties.forEach( element => { 
         if (element.gratty_id > max) {
           max = element.gratty_id;
         }
       })
       console.log('new gratty:');
       console.log(req.body);
       console.log('current max gratty id:');
       console.log(max);
       let gratty = {
         description: req.body.description,
         gratty_id: max + 1,
         date: Date.now()
       }
       console.log(gratty);
       user.gratties.push(gratty);
       user.save();
       res.status(201).send();
     }
     else { /* send error if user does not exist */
       res.status(404).send();
     }
   })
 })

/* GET all gratties */
router.get(('/:username/gratties'), function(req, res, next) {
  /* get username from URL */
  let username = req.params.username;
  console.log(username);
  /* find film */
  User.findOne( {username: username}, (err,user)=>{
    if (user) { /*if user is found, return that user's gratties */
      console.log(user.gratties);
      res.send(user.gratties);
    }
    else { /* if user is not found, 404 error */
      res.status(404).send();
    }
  })
})

/* GET a specific gratty */
router.get(('/:username/gratties/:gratty_id'), function(req, res, next) {
  /* get username and gratty_id from URL */
  let username = req.params.username;
  let gratty_id = req.params.gratty_id;
  console.log(username);
  console.log(gratty_id);
  /* find user */
  User.findOne( {username: username}, (err,user)=>{
    if (user) {
      /* find gratty from gratty_id */
     let gratty = user.gratties.find(element => element.gratty_id == gratty_id);
     if (gratty) {
       console.log(gratty);
       res.send(gratty);
     }
     else { /* user found, but gratty_id not found, so error */
       res.status(404).send();
     }
    }
    else { /* user not found */
      res.status(404).send();
    }
  })
})

/* PUT to update/create a gratty */
router.put(('/:username/gratties/:gratty_id'), function(req, res, next) {
  /* get username and gratty_id from URL */
  let username = req.params.username;
  let gratty_id = req.params.gratty_id;
  console.log(username);
  console.log(gratty_id);
  /* find user */
  User.findOne( {username: username}, (err,user)=>{
    if (user) { /* if user is found, search for gratty from gratty_id */
     let gratty = user.gratties.find(element => element.gratty_id == gratty_id);
     if (gratty) { /* if gratty is found, update it */
      console.log(user.gratties);
      console.log(gratty);
      gratty.description = req.body.description,
      user.save();
      res.status(201).send();
     }
     else {
       /* add gratty */
      let gratty = {
        description: req.body.description,
        gratty_id: req.params.gratty_id,
        date: Date.now()
      }
      console.log(gratty);
      user.gratties.push(gratty);
      user.save();
      res.status(201).send();
     }
    }
    else {
      res.status(404).send();
    }
  })
})

/* DELETE a gratty */
router.delete(('/:username/gratties/:gratty_id'), function(req, res, next) {
   /* get username and gratty_id from URL */
   let username = req.params.username;
   let gratty_id = req.params.gratty_id;
   console.log(username);
   console.log(gratty_id);
   /* find user */
   User.findOne( {username: username}, (err,user)=>{
     if (user) {
      let grattyIndex = user.gratties.findIndex(element => element.gratty_id == gratty_id);
      if (grattyIndex !== -1) {
        user.gratties.splice(grattyIndex, 1);
        user.save();
        res.status(201).send();
      }
      else {
        res.status(404).send();
      }
     }
     else {
       res.status(404).send();
     }
   })
})

module.exports = router;
