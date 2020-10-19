//catchAsync function to get rid of all the try catch blocks and make our code more modular
module.exports = (fn) => {
  return (req, res, next) => {
    //javascript provides a functionality in which if you want to call a single function in the then/catch methods
    //then you just need to specify the function to be called and js impicitly passes the argument for you and calls
    //that function!! ---> catch(err => next(err)) ---> catch(next);
    fn(req, res, next).catch(next);
  };
};
