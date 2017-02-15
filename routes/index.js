var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var s = require("underscore.string");
// our db model
var Category = require("../models/model.js");
// api.ai 
var apiai = require('apiai');
var apiapp = apiai(process.env.APIAI_TOKEN);

// simple route to render am HTML form that can POST data to our server
// NOTE that this is not a standard API route, and is really for testing
router.get('/create-category', function(req,res){
  res.render('category-form.html')
})

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {
  
  var jsonData = {
  	'name': 'node-express-api-boilerplate',
  	'api-status':'OK'
  }

  // respond with json data
  res.json(jsonData)
});


router.post('/games/categories', function(req, res){

  console.log("DEBUG: webhook post body");
  console.log(req.body);
  console.log("////");

  var sessionId = req.body.sessionId; 
  var action = req.body.action;

  if (action === 'game.1.start'){
    // start game 1
    // get list of categories and choose one at random.
    // 
    Category.find({}, function(err,data){

      // if err or no category found, respond with error 
      if(err || data == null){
        var error = {status:'ERROR', message: 'Could not find that category'};
         return res.json(error);
      }

      var randomIndex = getRandomInt(0, data.length - 1);
      var gameData = data[randomIndex];
      var resultItems = getRandomArrayElements(gameData.items, 4);

      console.log("Game Items");
      console.log(gameData.name);
      console.log(resultItems);

      // var entries = [];
      // for(var i = 0 ; i < resultItems.length; i++){
      //   entries.push({value: resultItems[i]});
      // }

      // console.log("DEBUG");
      // console.log(entries);
      // 
      // send back to API.AI
      // 
      // 
      
      var entityEntries = [
        {
          value: gameData.name,
          synonyms: [gameData.name.toLowerCase()]
        }
      ]

      var user_entities = [{
          name: 'test-me',
          // sessionId: sessionId,
          extend: false,
          entries: entries
      }];

      var user_entities_body = {
          sessionId: sessionId,
          entities: user_entities
      };

      var user_entities_request = apiapp.userEntitiesRequest(user_entities_body);

      user_entities_request.on('response', function(response) {
        console.log('User entities response: ');
        console.log(response);

        var newResponse = {
          "speech": "This is just a test, here i'll send something nice",
          "displayText": "testing testing testing.",
          "data": {"test": "testdata"},
          "contextOut": [{"name":"TestContext", "lifespan":1, "parameters":{"answer":gameData.name}}],
          "source": "Calypso"
        }

        console.log(newResponse)

        res.json(newResponse);

        // request(options, function (error, response, body) {
        //   console.log("OUR GET REQUEST:")
        //   if (!error && response.statusCode == 200) {
        //     console.log("YAY WE HAVE SOMETHING");
        //     console.log(body); 
        //     res.json(body);
        //   }else{
        //     console.log("BOO WE HAVE NOTHING");
        //     console.log(error);
        //     res.json(error);
        //   }
        // });

        // var request = apiapp.textRequest('Open application Firefox', {sessionId: "123"});

        // request.on('response', function(response) {
        //     console.log('Query response: ');
        //     console.log(response);
        // });

        // request.on('error', function(error) {
        //     console.log("On Error:");
        //     console.log(error);
        // });

        //request.end();
    });

    user_entities_request.on('error', function(error) {
        console.log(error);
    });

    user_entities_request.end();
    
    });
  }
  else if (action === 'game.2.start'){
    // start game 2
  }else {
    // not sure what to do?  handle other actions.
  }


var options = {
  url: 'https://api.api.ai/v1/userEntities/' + user_entities[0].name + '?sessionId=' + sessionId ,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 0ed8a24261504f2fafa95aaf6a07f8f3'
  }
};

});


// /**
//  * POST '/api/create'
//  * Receives a POST request of the new category, saves to db, responds back
//  * @param  {Object} req. An object containing the different attributes of the Category
//  * @return {Object} JSON
//  */

router.post('/api/create', function(req, res){

    console.log(req.body);

    // pull out the information from the req.body
    var name = req.body.name;
    var items = req.body.items.split(","); // split string into array

    for (var i = 0; i < items.length; i++) {
      items[i] = s(items[i]).trim().toLowerCase().value();
    }

    console.log("DEBUG:");
    console.log(items);

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var categoryObj = {
      name: name,
      items: items
    };

    // create a new category model instance, passing in the object
    var category = new Category(categoryObj);

    // now, save that category instance to the database
    // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
    category.save(function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {status:'ERROR', message: 'Error saving category'};
        return res.json(error);
      }

      console.log('saved a new category!');
      console.log(data);

      // now return the json data of the new category
      var jsonData = {
        status: 'OK',
        category: data
      }

      return res.json(jsonData);

    })  
});

// /**
//  * GET '/api/get/:id'
//  * Receives a GET request specifying the category to get
//  * @param  {String} req.params.id - The categoryId
//  * @return {Object} JSON
//  */

router.get('/api/get/:id', function(req, res){

  var requestedId = req.params.id;

  // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
  Category.findById(requestedId, function(err,data){

    // if err or no user found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that category'};
       return res.json(error);
    }

    // otherwise respond with JSON data of the category
    var jsonData = {
      status: 'OK',
      category: data
    }

    return res.json(jsonData);
  
  })
})

// /**
//  * GET '/api/get'
//  * Receives a GET request to get all category details
//  * @return {Object} JSON
//  */

router.get('/api/get', function(req, res){

  // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
  Category.find(function(err, data){
    // if err or no categorys found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find categorys'};
      return res.json(error);
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      categorys: data
    } 

    res.json(jsonData);

  })

})

// /**
//  * GET '/api/search'
//  * Receives a GET request to search an category
//  * @return {Object} JSON
//  */
router.get('/api/search', function(req,res){

  // first use req.query to pull out the search query
  var searchTerm = req.query.name;
  console.log("we are searching for " + searchTerm);

  // let's find that category
  Category.find({name: searchTerm}, function(err,data){
    // if err, respond with error 
    if(err){
      var error = {status:'ERROR', message: 'Something went wrong'};
      return res.json(error);
    }

    //if no categorys, respond with no categorys message
    if(data==null || data.length==0){
      var message = {status:'NO RESULTS', message: 'We couldn\'t find any results'};
      return res.json(message);      
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      categorys: data
    } 

    res.json(jsonData);        
  })

})

// /**
//  * POST '/api/update/:id'
//  * Receives a POST request with data of the category to update, updates db, responds back
//  * @param  {String} req.params.id - The categoryId to update
//  * @param  {Object} req. An object containing the different attributes of the Category
//  * @return {Object} JSON
//  */

router.post('/api/update/:id', function(req, res){

   var requestedId = req.params.id;

   var dataToUpdate = {}; // a blank object of data to update

    // pull out the information from the req.body and add it to the object to update
    var name, age, weight, color, url; 

    // we only want to update any field if it actually is contained within the req.body
    // otherwise, leave it alone.
    if(req.body.name) {
      name = req.body.name;
      // add to object that holds updated data
      dataToUpdate['name'] = name;
    }
    if(req.body.age) {
      age = req.body.age;
      // add to object that holds updated data
      dataToUpdate['age'] = age;
    }
    if(req.body.weight) {
      weight = req.body.weight;
      // add to object that holds updated data
      dataToUpdate['description'] = {};
      dataToUpdate['description']['weight'] = weight;
    }
    if(req.body.color) {
      color = req.body.color;
      // add to object that holds updated data
      if(!dataToUpdate['description']) dataToUpdate['description'] = {};
      dataToUpdate['description']['color'] = color;
    }
    if(req.body.url) {
      url = req.body.url;
      // add to object that holds updated data
      dataToUpdate['url'] = url;
    }

    var tags = []; // blank array to hold tags
    if(req.body.tags){
      tags = req.body.tags.split(","); // split string into array
      // add to object that holds updated data
      dataToUpdate['tags'] = tags;
    }


    console.log('the data to update is ' + JSON.stringify(dataToUpdate));

    // now, update that category
    // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
    Category.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {status:'ERROR', message: 'Error updating category'};
        return res.json(error);
      }

      console.log('updated the category!');
      console.log(data);

      // now return the json data of the new person
      var jsonData = {
        status: 'OK',
        category: data
      }

      return res.json(jsonData);

    })

})

/**
 * GET '/api/delete/:id'
 * Receives a GET request specifying the category to delete
 * @param  {String} req.params.id - The categoryId
 * @return {Object} JSON
 */

router.get('/api/delete/:id', function(req, res){

  var requestedId = req.params.id;

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
  Category.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that category to delete'};
      return res.json(error);
    }

    // otherwise, respond back with success
    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}


module.exports = router;