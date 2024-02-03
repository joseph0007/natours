import axios from 'axios';
import { addAlert } from './alertMessage';

export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? '/api/v1/users/updatepassword'
      : '/api/v1/users/updateme';

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
