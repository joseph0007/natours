const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const Booking = require('../Models/BookingModel');
const Tours = require('../Models/TourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.createSession = catchAsync(async (req, res, next) => {
  // 1.Get the tour
  const tour = await Tours.findById(req.params.tourId);

  //create a session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //not safe because we are exposing the tour and user id
    //success_url only requests using a GET method!! and so we needed to use a query string!
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    client_reference_id: req.params.tourId,
    customer_email: req.user.email,

    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/tour-1-cover.jpg`],
        currency: 'inr',
        amount: tour.price * 100,
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  //send the session to the client
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  //creating a new Booking document
  await Booking.create({
    tour,
    user,
    price,
  });

  //redirecting the page to the same url but without the query string
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.GenericCreateOne(Booking);
exports.updateBooking = factory.GenericUpdateOne(Booking);
exports.deleteBooking = factory.GenericDeleteOne(Booking);
exports.getBooking = factory.GenericGetOne(Booking, { path: 'user tour' });
exports.getAllBooking = factory.GenericGetAll(Booking);
