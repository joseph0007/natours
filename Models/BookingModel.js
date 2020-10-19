const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tours',
    required: [true, 'Booking should have a tourId!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'Booking should have a userId!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking should have a price'],
  },
  paid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
