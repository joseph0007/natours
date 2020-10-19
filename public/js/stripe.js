import axios from 'axios';
import { addAlert } from './alertMessage';

export const bookTour = async (tourId) => {
  try {
    // 1. to send a xhr request to the server to retrieve a session
    //since it is a GET method we dont need to specify it as it is the default method!!we just need to specify the request url!!
    const session = await axios(
      `${window.origin}/api/v1/bookings/checkout-session/${tourId}`
    );

    // create a Stripe object instance
    var stripe = Stripe(
      'pk_test_51HdVPkGONLSY38qKTtDz91jbnvO12EAQ8yBI0BrZMD3xAbsvL2ChmTHT8k0hRrudfVBRJpDa8Fx6Q0qlTSB9fjo5003woFNwsG'
    );

    // redirect the page to checkout form
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    addAlert(error.response.data.message);
  }
};
