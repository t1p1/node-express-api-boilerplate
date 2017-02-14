var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var s = require("underscore.string");
// our db model
var Category = require("../models/model.js");

// simple route to render am HTML form that can POST data to our server
// NOTE that this is not a standard API route, and is really for testing
router.get('/create-category', function(req,res){
  res.render('category-form.html')
})

// simple route to render an HTML page that pulls data from our server and displays it on a page
// NOTE that this is not a standard API route, and is really for testing
router.get('/show-categories', function(req,res){
  res.render('show-categories.html')
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

// simple route to show an HTML page
router.get('/sample-page', function(req,res){
  res.render('sample.html')
})

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

module.exports = router;