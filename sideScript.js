// app.get('/', (req, res) => {
//     res.status(200).send('server satrted and ready to take requests.');
//   });

// the callback function here is called the route handler!!
// if the data inside a variable(not necessarily, it can just be any data) does not define a state or state a state at that point in the
// code at that time then it is functional programming in which the data of the variable is just the data assigned to it by the
// general flow of the code.This is called stateless/functional programming.
// whereas if the data's sole purpose is to define the state the code or program is in a particular point then that
// data is a state data and it is called as statefull programming!!

//   app.post('/', (req, res) => {
//     res.status(200).json([{ message: 'server json response', status: '200' }]);
//   });

//express.json() is a middleware which is used to send data inside the request body
//since express does not come with an inbuild middleware we have to use express.json() middleware which can be only used with
//json file send in the request header.

// the part of the url that comes after the domain name(ip/port number) is called as the end-point of the url
// and it can contain the path like ('/api/v1/tours') or it can contain the query('?id=1&name=joseph') or both
// the path and the query('/api/v1/tours?id=1&name=joseph')!!!
// the v1 in the resource locator is to indicate the version number of the api so when we upgrade the api it should not break the
// code for all the people that are using the v1 of the api!!!

//using url parameters ---> req.params object
//req.params object is something that can be used to store the incoming request data into an object by using ":" before the
//variable name and if that parameter is optional then follow the variable with a "?" ---> (:x?)  !!

// PUT and PATCH http methods are used to update data
// PUT --> expects an entire object(or any construct) with updated data in request
// PATCH ---> is much light weight than PUT and only expects a particular property that needs to be changed!!

//DELETE ---> is used to delete data and with DELETE requests we usually dont send back any data and instead we send
//a status code 204 which means "no content" and with it a null data !!

//middleware
/**
 * middleware are pieces of code that does some kind of processing on the req/res Object and then calls the next() method
 * once it is done processing it and is ready to passover the objects to the next middleware function.
 * the middleware functions are executed in the order that they are written inside the code.
 * all the middleware together is called as the middleware stack and at the end of this stack it is usually the
 * route function which sends the response back and completes the request/response cycle!!!
 * the middleware is the first set of code that will be executed when a request is received by the server!!
 */

//MOUNTING MULTIPLE ROUTERS
/**
 * mounting routers mean adding another layer of router to make the routing more modular.
 * it can be thought of adding another middleware to the middleware stack.
 * so when routing the top layer router will handle the route matching to the route it has been assigned to handle and if the
 * route has some extra endpoint(query/another layer of resource or route) then it will try to look for the route in its
 * sub route and so on and so forth.
 *
 */

//COMPILED VS INTERPRETED
/**
 * a compiler and an interpreter are both used for one purpose converting program or instruction written in human language into
 * assembly language which is then converted into machine language(binary).
 * a compiler converts the entire instruction at once and then gives it to the cpu for processing
 * a interpreter only converts one instruction at a time and send it to the cpu for processing.It does it one by one and hence
 * they are slower and take more time but on the other hand it is easier to rectify a wrong instruction.
 *
 */

// Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without
// changing its external behavior

//all the routes
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//a better way of writing the above route handlers
// userRouter.route('/').get(getAllUsers).post(createUser);
// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// express philosophy is to follow a pipeline architecture wherein each middleware function is used to perform certain task
// we should follow this philosophy as much as possible and where it is not possible we can find our ways of implementing it
// without breaking the DRY principle.

// my method ---> very long and unnecessary!!!
// exports.checkBody = (req, res, next) => {
//     console.log(req.body);
//     let check = Object.keys(req.body).map((el) => {
//       if (el === 'name' || el === 'difficulty') {
//         return true;
//       } else {
//         return false;
//       }
//     });

//     let count = 0;
//     check.forEach((el) => {
//       if (el === true) {
//         count++;
//       }
//     });

//     if (count < 2) {
//       return res.status(404).json({
//         status: 'failed',
//         message: 'not found!',
//       });
//     }

//     next();
//   };

// ENVIROMENT VARIABLES
/**
 * enviroment variables are the variables that are set for each time a process starts (process.env), a lot of these variables are set
 * internally by node when we start a process.Express also sets some of the environment variables such as 'env' which by default
 * set to 'development'.
 * these environment variables can be used to set logging on/off, set different databases depending on the environment we are in,
 * we also set the number of working threads, etc. these variables are set by the core_modules of the node.
 * but we can also set them manually!!
 * when we name an environment variable we usually use uppercase letters(a convention)!!
 * there are 2 ways of setting them :-
 * 1.each time when we start a process using the terminal we can set it there
 * for powershell : $env:NODE_ENV="production"
 * for cmd : set NODE_ENV="production"
 *
 * 2.create a config.env file to set all of it there and then use a npm package to actually link it to the main process!!
 */

// all the npm prettier and eslint packages needs to be installed locally(in the working directory), it will not work
// if installed globally!!

// eslint is a code formatter which imposes a set of rules that should be followed while writing code.
// it can be defined as is a tool that analyzes source code to flag programming errors, bugs, stylistic errors, and suspicious constructs.

//MONGODB
/**
 * mongodb uses a non-sql format, which means it doesnt use SQL(structured query language), instead it uses file type storage
 * (which is similar to a JSON file).
 * This file is called as BSON which is similar to JSON but it is a "typed" documnet(which means it has datatypes)!!
 * compared to relational database ----> tables ----> collection and rows ----> columns.
 * it uses embedding and denormalization whereas traditional databases uses the concept of normalization!!
 */

//creating a document based on the model
// const tours = new Tours({
//   name: 'snow boarder',
//   price: 600,
// });

// tours
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log('error', err));

//logging the main process environment variable!!
// console.log(process.env);

//this is the environment variable set by express module
//which is by default set to development
// console.log(app.get('env'));

//read the data for tours
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// exports.checkID = (req, res, next, val) => {
//   //if we multiply a number enclosed in a string with a number then it evalates it and converts it into a number
//   if (!tours.find((el) => el.id === val * 1)) {
//     //important to return the function from here so that the middleware function does not call the next() method
//     return res.json({
//       status: 'fail',
//       message: 'tour not found',
//     });
//   }
//   next();
// };

// exports.createTour = (req, res) => {
//     //figuring out the id
//     let newTour = {};
//     newTour.id = tours[tours.length - 1].id + 1;

//     //merge the two objects into one using the static Object() method called assign()!!
//     Object.assign(newTour, req.body);

//     //push the newly created object into the tours array
//     tours.push(newTour);

//     //add the newly created tour to the tours-simple.json file
//     fs.writeFile(
//       `${__dirname}/dev-data/data/tours-simple.json`,
//       JSON.stringify(tours),
//       (err) => {
//         // status 201 ---> created
//         res.status(201).json({
//           status: 'success',
//           data: {
//             newTour,
//           },
//         });
//       }
//     );
//   };

//middleware function for checking if the body has name and difficulty properties
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.difficulty) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'not found!',
//     });
//   }
//   next();
// };

/**
 * if we define a schema with specified set of keys and while sending request if we pass in an object with more than the number
 * of keys specified in the schema then the schema will just ignore all the keys that were not mentioned in the schema!!
 */

/**
 * when we create a model we basically bind that model to the database collection that we are passing inside the model() function
 * as an argument and then when we want to perform any operations namely CRUD we perform on that collection that is binded
 * to that model that we created!!!
 */

// exports.getAllTours = async (req, res) => {
//     try {
//       /**
//        * Note that the find() returns a Query Object which when we await goes to the database and fetches for the document
//        * if we dont await it it will not fetch the document right away!! there is some internal code that when we await
//        * the Query object, it will wrap the object inside a promise and fetch the document!!
//        * each time we use a query method on a Query object it will return a Query object and then we can use another
//        * query method on it and so on and so forth.
//        */

//       //the req.query object is parsed by the express module and if we were to not use the express module then we would
//       //have had to use some other module to parse the query into an object like Body parser

//       //method 1: using the filter object to find the document
//       // const { difficulty } = req.query;
//       // const tours = await Tours.find({ difficulty: difficulty });

//       //make the above method more robust
//       /**
//        * a cool way of destructuring an object using (...) spread operator into an object literal and creating a new object out
//        * of it. this is done because using a simple "=" will just create a refrence to the original object and any changes
//        * will also reflect in that object!!!
//        */

//       console.log(req.query);

//       //formatting the url part 1
//       let newObj = { ...req.query };
//       const removeList = ['fields', 'limit', 'page', 'sort'];

//       removeList.forEach((el) => delete newObj[el]);

//       //formatting the url for any operator intented for mongodb quering
//       //by default if we pass any operator inside a [] in the url the express module will parse it into an object!!
//       //adding the "$" to enforce mongodb syntax
//       const queryStr = JSON.stringify(newObj).replace(
//         /\b(lte|lt|gte|gt)\b/g,
//         (match) => `$${match}`
//       );

//       newObj = JSON.parse(queryStr);
//       console.log(newObj);

//       //Query Object
//       let query = Tours.find(newObj);

//       //SORTING
//       /**
//        * sort() automatically sorts the documents according to the given key STRING eg: 'price' and if we dont specify a
//        * "-" before the key then it sorts it in ascending order and if we specify the key with the '-' in front
//        * then it will sort it in descending order.
//        * IF there is an exact match for the given key then we can pass in another key which will then be used to sort
//        * the documents!!
//        */
//       if (req.query.sort) {
//         const sortBy = req.query.sort.split(',').join(' ');
//         query = query.sort(sortBy);
//       }

//       //LIMITING FIELDS(PROJECTION)
//       /**
//        * this field is used to show only the necessary data and not all the data to the user basically like a projection object
//        * used in mongodb!!
//        * if "-" is used before the field name then it will exclude it instead of including it!!
//        */

//       if (req.query.limits) {
//         const fields = req.query.fields.split(',').join(' ');
//         query = query.select(fields);
//       } else {
//         query = query.select('-__v');
//       }

//       //PAGINATION
//       /**
//        * Pagination is used to divide the result documents into pages so that they are much more organised and readable
//        * for the user.
//        * moongoose provides 2 methods skip() which receives a number which then skips that many number of documents
//        * from the result and limit() which also receives a number which will be the number of documents per page.
//        */

//       const page = req.query.page * 1 || 1;
//       const limit = req.query.limit * 1 || 100;
//       const skipNum = (page - 1) * limit;

//       if (req.query.page) {
//         const docCount = await Tour.countDocuments();
//         if (skipNum >= docCount) throw Error('no more documents');
//       }

//       query.skip(skipNum).limit(limit);

//       const tours = await query;

//       //method 2: using the Query object methods to find the document
//       // const { difficulty } = req.query;
//       // const tours = await Tour.find()
//       //   .where('difficulty')
//       //   .equals(difficulty)
//       //   .where('duration')
//       //   .equals(5);

//       //we are using the JSEND method to send the json file
//       res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         //requestTime: req.requestTime,
//         // ES6 syntax where if the value and key names are same then no need to specify the key name explicitly!!
//         data: {
//           tours,
//         },
//       });
//     } catch (err) {
//       res.status(404).json({
//         status: 'fail',
//         message: err,
//       });
//     }
//   };

//AGGREGATION PIPELINE
/**
 * this is basically momgodb feature for data manipulation to get meaningful information from the data that is available to us.
 * this is basically like the aggregation operations that can be performed in a traditional database.
 * this pipeline is basically an array of objects with each object being a stage in the pipeline process,
 * there can be many stages with repeating stages as well.for more info on this refer mongodb documentation!!!
 */

/**
 * the url that we pass to the server is then checked against the Routes declared inside the API
 * and if it finds and matches that Route then it executes the handler function but in some cases if we dont specify the
 * exact route and we just add another endpoint to a valid Route then it will match the Route uptill the valid Route
 * and execute its handler!!!
 */

//NOTE: convertion of array into object dor retrieving documents from momgodb
/**
 * when we pass duplicate query values into the string the express module parses it into a req.query object which contains
 * the duplicate field name as the key with the values provided as an array!!
 * But mongodb does not accept array objects in filter object for querying yet the mongoose module uses the utils.js
 * core_modules to convert the array into a object which can then be used to retrieve the document one after the another for
 * each value in the array!!
 * used "ndb" tool to figure this one out!!
 */

//REFACTORED FUNCTIONS
//  catchAsync(async (req, res, next) => {
//     //method 1
//     // const tour1 = new Tour({
//     //   name: 'the skiing legends',
//     //   price: 260,
//     // });
//     // tour1.save().then((data) =>
//     //   res.json({
//     //     status: 'success',
//     //     data,
//     //   })
//     // );

//     //method  2
//     const data = await Tour.create(req.body);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         data,
//       },
//     });
//   });

// catchAsync(async (req, res, next) => {
//     const review = await Review.create({
//       review: req.body.review,
//       rating: req.body.rating,
//       tourID: req.body.tourID,
//       userID: req.body.userID,
//     });

//     res.status(200).json({
//       status: 'success',
//       review,
//     });
//   });
