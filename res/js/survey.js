document.addEventListener('DOMContentLoaded', function () {
    var webpageSubmission;
    const userAgent = navigator.userAgent;
    const submitBtn = document.querySelector(".submitBtn button");
    const post = document.querySelector(".post");
    const widget = document.querySelector(".rating-widget");
    const changeBtn = document.querySelector(".change");
    const mainMessage = document.querySelector('.main-message');
    let initialRequestSent = false; // Flag to prevent double API requests
    let lastSelectedCesRating = null; // To track the last selected CES rating

    // Function to get URL parameters
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to send the combined rating and comment to the API
    function sendCesRating(starRating, cesRating = null, comment = '') {
        const token = getQueryParam('token');
        const ticketCode = getQueryParam('issue-key');

        if (!token || !ticketCode || !starRating) {
            return;
        }

        const formData = {
            token: token,
            ticketCode: ticketCode,
            csatRating: starRating,
            cesRating: cesRating,
            comment: comment,
            userAgent: userAgent,
            webpageSubmission: webpageSubmission 
        };

        // Send data to Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbx9CPj5JV8WAPe9RpxW_dLEeuPx6H5jNRI1mTDq7vgvAsIxnRkata6PcwbodKEu2kcF/exec', {

            redirect: "follow",
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(formData),  // Convert the form data into a JSON string
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        })
            .then(response => response.text())
            .catch((error) => {
                console.error('Error:', error);
                alert('Error: ' + error);  // Show an error message
            });
    }

    // Function to handle the review submission
    function submitReview(event) {
        event.preventDefault();
        webpageSubmission = "true"

        const starRatingInput = document.querySelector('input[name="rate"]:checked');
        const starRating = starRatingInput ? starRatingInput.id.split('-')[1] : null;
        const commentText = document.getElementById('commentText').value;

        if (starRating) {
            sendCesRating(starRating, lastSelectedCesRating, commentText);
            updateMainMessage(starRating);

            // Show the post-feedback message
            widget.style.display = "none";
            post.style.display = "block";
        } else {
        }
    }

    // Function to update the main message based on star rating
    function updateMainMessage(rating) {
        switch (rating) {
            case '5':
            case '4':
                mainMessage.textContent = 'Awesome! We got it.';
                break;
            case '3':
                mainMessage.textContent = 'Thanks! We got it.';
                break;
            case '2':
            case '1':
                mainMessage.textContent = 'Sorry to hear that.';
                break;
            default:
                mainMessage.textContent = '';
        }
    }

    // Auto-select rating based on URL parameter and send the initial API request
    function autoSelectAndSendInitialRating() {
        const rating = getQueryParam('rating');
        if (rating && rating >= 1 && rating <= 5) {
            const ratingId = 'rate-' + rating;
            const ratingInput = document.getElementById(ratingId);
            if (ratingInput) {
                ratingInput.checked = true;
                updateMainMessage(rating);

                // Only send the initial API request if no other request has been made
                if (!initialRequestSent) {
                    sendCesRating(rating); // Send the initial rating without CES or comment
                    initialRequestSent = true; // Mark that the initial request has been sent
                }
            }
        }
    }

    // Attach event listeners to star ratings
    const stars = document.querySelectorAll('.star-rating input[type="radio"]');
    stars.forEach(star => {
        star.addEventListener('click', function () {
            webpageSubmission = "true"
            const rating = this.id.split('-')[1];

            // Prevent double API requests if the initial request was already sent
            if (!initialRequestSent) {
                initialRequestSent = true;
            } else {
                // Include the last selected CES rating in the API request
                sendCesRating(rating, lastSelectedCesRating);
            }

            updateMainMessage(rating); // Update the main message
        });
    });

    // Attach event listeners to CES ratings
    const cesOptions = document.querySelectorAll('.radio-group input[type="radio"]');
    cesOptions.forEach(option => {
        webpageSubmission = "true";
        option.addEventListener('click', function () {
            const starRatingInput = document.querySelector('input[name="rate"]:checked');
            const starRating = starRatingInput ? starRatingInput.id.split('-')[1] : null;
            lastSelectedCesRating = this.id; // Store the selected CES rating
            if (starRating) {
                sendCesRating(starRating, lastSelectedCesRating); // Send star and CES rating with no comment
            } else {
                console.log('Please select a star rating first.');
            }
        });
    });

    // Send the initial API request on page load
    autoSelectAndSendInitialRating();

    // Attach the event listener to the submit button
    submitBtn.addEventListener('click', submitReview);

    // Handle the change of feedback form
    changeBtn.onclick = () => {
        widget.style.display = "block";
        post.style.display = "none";
    };
});