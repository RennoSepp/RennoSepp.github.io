document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.querySelector(".submitBtn button");
    const post = document.querySelector(".post");
    const widget = document.querySelector(".rating-widget");
    const changeBtn = document.querySelector(".change");
    const mainMessage = document.querySelector('.main-message');

    // Function to get URL parameters
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to send the combined rating and comment to the API
    function sendCesRating(starRating, cesRating, comment) {
        const token = getQueryParam('token');
        const issueKey = getQueryParam('issue-key');

        if (!token || !issueKey) {
            console.error("Required parameters are missing.");
            return;
        }

        comment = cesRating ? `${cesRating}: ${comment}` : comment;

        const data = {
            token: token,
            rating: starRating,
            comment: comment
        };

        const apiUrl = `https://glia.atlassian.net/rest/servicedesk/1/customer/feedback/portal/4/${issueKey}`;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    // Function to handle the review submission
    function submitReview(event) {
        event.preventDefault();

        const starRatingInput = document.querySelector('input[name="rate"]:checked');
        const starRating = starRatingInput ? starRatingInput.id.split('-')[1] : null;
        const cesRatingInput = document.querySelector('.radio-group input[name="rating"]:checked');
        const cesRating = cesRatingInput ? cesRatingInput.className : null;
        const commentText = document.getElementById('commentText').value;

        if (starRating) {
            sendCesRating(starRating, cesRating, commentText);
            updateMainMessage(starRating); // Update the main message based on star rating
        } else {
            console.log('Please select a star rating.');
        }

        widget.style.display = "none";
        post.style.display = "block";
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

    // Auto-select rating based on URL parameter
    function autoSelectRating() {
        let rating = getQueryParam('rating');
        if (rating && rating >= 1 && rating <= 5) {
            const ratingId = 'rate-' + rating;
            const ratingInput = document.getElementById(ratingId);
            if (ratingInput) {
                ratingInput.checked = true;
                updateMainMessage(rating);
            }
        }
    }

    // Auto-select rating when the page loads
    autoSelectRating();

    // Attach the event listener to the submit button
    submitBtn.addEventListener('click', submitReview);

    // Handle the change of feedback form
    changeBtn.onclick = () => {
        widget.style.display = "block";
        post.style.display = "none";
    };
});
