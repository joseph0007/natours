import '@babel/polyfill';
import { login, logOut } from './login';
import { setMap } from './mapBox';
import { bookTour } from './stripe';
import { updateSettings } from './updateSettings';

const logOutBtn = document.querySelector('.nav__el--logout');
const formEle = document.querySelector('.form--login');
const updateForm = document.querySelector('.form-user-data');
const updatePass = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-btn');

if (formEle) {
  formEle.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    console.log(email, password);

    login(email, password);
  });
}

setMap();

if (logOutBtn) {
  logOutBtn.addEventListener('click', logOut);
}

if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    //get user details
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    //to send multipart form data we need to create a FormData object and append the files to it
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    //rendering the button
    const btn = document.querySelector('.btn--details');
    btn.textContent = 'updating...';

    //update data
    await updateSettings(form, 'user-details');

    //re-render the button
    btn.textContent = 'Save settings';
  });
}

if (updatePass) {
  updatePass.addEventListener('submit', async (e) => {
    e.preventDefault();

    //get user details
    const newPassword = document.getElementById('password').value;
    const password = document.getElementById('password-current').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    //rendering the button
    const btn = document.querySelector('.btn--password');
    btn.textContent = 'updating...';

    //update data
    await updateSettings(
      { password, newPassword, confirmPassword },
      'password'
    );

    //re-render the button
    btn.textContent = 'save password';

    //clear the fields
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.getElementById('password-current').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    const { tourId } = e.target.dataset;

    bookBtn.textContent = 'Processing...';

    //call the bookTour function to redirect to checkout page
    await bookTour(tourId);

    bookBtn.textContent = 'Book tour now!';
  });
}
