// Example pop up
//document.getElementById('openPopup').addEventListener('click', function() {
// document.getElementById('popup').style.display = 'block';
// });

// document.getElementById('closePopup').addEventListener('click', function() {
//  document.getElementById('popup').style.display = 'none';
//});

document.addEventListener('DOMContentLoaded', function () {
    const createPopUpButton = document.getElementById('openPopup');
    const hidePopUpButton = document.getElementById('closePopup');

    if (openPopup) {
        createPopUpButton.addEventListener('click', function () {
            document.getElementById('popup').style.display = 'block';
        })
    } else {
        console.error('Button with id "openPopup" not found.');
    }

    if (closePopup) {
        hidePopUpButton.addEventListener('click', function () {
            document.getElementById('popup').style.display = 'none';
        })
    } else {
        console.error('Button with id "closePopup" not found.');
    }
});
