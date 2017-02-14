var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var categorySchema = new Schema({
	name: {type: String, unique: true}, // this version requires this field to be unique in the db
	items: [String],
	dateAdded : { type: Date, default: Date.now },
})

// export 'Category' model so we can interact with it in other files
module.exports = mongoose.model('Category',categorySchema);