export const removeAlert = () => {
    const element = document.querySelector('.alert');
    if(element) {
        element.parentElement.removeChild(element);
    }
};

export const addAlert = (type, message) => {
    removeAlert();
    let markup = `<div class="alert alert--${type}">${message}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

    setTimeout(removeAlert, 5000);
};