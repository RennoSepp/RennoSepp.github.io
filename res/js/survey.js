let rating = 0;
const stars = document.querySelectorAll('.star');
stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        rating = index + 1;
        updateStars();
    });
});

function updateStars() {
    stars.forEach((star, index) => {
        star.style.color = index < rating ? 'purple' : 'gray';
    });
}

function submitReview() {
    const reviewText = document.getElementById('reviewText').value;
    console.log('Rating:', rating, 'Review:', reviewText);
    // Here you can add code to send data to a server
}

const submitBtn = document.querySelector(".submitBtn")
const post = document.querySelector(".post")
const widget = document.querySelector(".rating-widget")
const changeBtn = document.querySelector(".change")

submitBtn.onclick = ()=> {
    widget.style.display = "none";
    post.style.display = "block";
    event.preventDefault();
}

changeBtn.onclick = ()=> {
    widget.style.display = "block";
    post.style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    const starRatings = document.querySelectorAll('.rating-widget input[type="radio"]');
    const description = document.querySelector('.star-description');
    const mainMessage = document.querySelector('.main-message');

    starRatings.forEach(star => {
        star.addEventListener('change', function() {
            const rating = this.id.split('-')[1]; // Gets the number from id like 'rate-5'
            switch (rating) {
                case '5':
                    description.textContent = 'If you have a moment, tell us how it went so we can keep it up!';
                    mainMessage.textContent = 'Awesome! We got it.'
                    break;
                case '4':
                    description.textContent = 'If you have a moment, tell us how it went so we can keep it up!';
                    mainMessage.textContent = 'Awesome! We got it.'
                    break;
                case '3':
                    description.textContent = 'If you have a moment, tell us how it went so we can do better next time.';
                    mainMessage.textContent = 'Thanks! We got it.'
                    break;
                case '2':
                    description.textContent = 'If you have a moment, tell us how it went so we can do better next time.';
                    mainMessage.textContent = 'Sorry to hear that.'
                    break;
                case '1':
                    description.textContent = 'If you have a moment, tell us how it went so we can do better next time.';
                    mainMessage.textContent = 'Sorry to hear that.'
                    break;
                default:
                    description.textContent = 'Select a rating';
            }
        });
    });
});


window.addEventListener('load', function() {

    // Function to get URL parameters
    function getQueryParam(param) {
        let search = new URLSearchParams(window.location.search);
        return search.get(param);
    }

    // Get the 'rating' parameter from the URL
    let rating = getQueryParam('rating');

    if (rating && rating >= 1 && rating <= 5) {
        // Construct the ID of the corresponding input element
        const ratingId = 'rate-' + rating;

        // Find the radio input by its ID and check it
        const ratingInput = document.getElementById(ratingId);
        if (ratingInput) {
            ratingInput.checked = true;

            // Optional: If you want to simulate a click event on the label
            const ratingLabel = document.querySelector(`label[for="${ratingId}"]`);
            if (ratingLabel) {
                ratingLabel.click();
            }
        }
    }
});

// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to send the API request
function sendRating(rating) {
    const token = getQueryParam('token'); // Get the token from the URL
    const issueKey= getQueryParam('issue-key'); // Get the issue number from the URL

    // Check if the necessary parameters are present
    if (!token || !issueKey) {
        console.error("Required parameters are missing.");
        return;
    }

    // Construct the full API endpoint URL using the issue number
    const apiUrl = `https://api.example.com/issues/${issueKey}`;

    // Send the API request
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: rating, token: token })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Attach event listeners to star ratings
window.onload = function() {
    const stars = document.querySelectorAll('.star-rating label');
    stars.forEach(label => {
        label.addEventListener('click', function() {
            const rating = this.htmlFor.split('-')[1]; // Extract rating from the 'for' attribute
            sendRating(rating); // Send the rating to the API
        });
    });
};
