import axios from 'axios';
import { addAlert } from './alertMessage';

export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users/updatepassword'
      : 'http://127.0.0.1:3000/api/v1/users/updateme';

  try {
    //use axios to make a xhr request to our api
    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });

    addAlert('success', response.data.message);
  } catch (err) {
    console.log(err);
    addAlert('error', err.response.data.message);
  }
};
