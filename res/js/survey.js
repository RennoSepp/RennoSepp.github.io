

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
    const mainMessage = document.querySelector('.main-message');

    starRatings.forEach(star => {
        star.addEventListener('change', function() {
            const rating = this.id.split('-')[1]; // Gets the number from id like 'rate-5'
            switch (rating) {
                case '5':
                    mainMessage.textContent = 'Awesome! We got it.'
                    break;
                case '4':
                    mainMessage.textContent = 'Awesome! We got it.'
                    break;
                case '3':
                    mainMessage.textContent = 'Thanks! We got it.'
                    break;
                case '2':
                    mainMessage.textContent = 'Sorry to hear that.'
                    break;
                case '1':
                    mainMessage.textContent = 'Sorry to hear that.'
                    break;
                default:
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
    const apiUrl = `https://glia.atlassian.net/rest/servicedesk/1/customer/feedback/portal/4/${issueKey}`;

    // Send the API request
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, rating: rating })
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

function sendCesRating(starRating, radioButtonValue) {
    const token = getQueryParam('token'); // Get the token from the URL
    const issueKey= getQueryParam('issue-key');
    if (!token || !issueKey) {
        console.error("Required parameters are missing.");
        return;
    }
    const data = {
        token: token,
        rating: starRating,
        comment: radioButtonValue
    };

    const apiUrl = `https://glia.atlassian.net/rest/servicedesk/1/customer/feedback/portal/4/${issueKey}`;

  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  

function getSelectedStarRating() {
    const starRating = document.querySelector('input[name="rate"]:checked');
    return starRating.id.split('-')[1];
}

window.onload = function() {
    // Attach event listeners to star ratings
    const stars = document.querySelectorAll('.star-rating label');
    stars.forEach(label => {
        label.addEventListener('click', function() {
            const rating = this.htmlFor.split('-')[1]; // Extract rating from the 'for' attribute
            sendRating(rating); // Send the rating to the API
        });
    });
    // Attach event listeners to CES ratings
    document.querySelectorAll('.radio-group input[type="radio"]').forEach((radioButton) => {
        radioButton.addEventListener('click', () => {
          const starRating = getSelectedStarRating();
          const radioButtonValue = radioButton.className;
          if (starRating) {
            sendCesRating(starRating, radioButtonValue);
          } else {
            console.log('Please select a star rating first.');
          }
        });
      });

      document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.querySelector(".submitBtn button");
    const post = document.querySelector(".post");
    const widget = document.querySelector(".rating-widget");
    const changeBtn = document.querySelector(".change");

    function submitReview(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way

        // Get the selected star rating
        const starRatingInput = document.querySelector('input[name="rate"]:checked');
        const starRating = starRatingInput ? starRatingInput.id.split('-')[1] : null;

        // Get the selected radio button for CES
        const cesRatingInput = document.querySelector('.radio-group input[name="rating"]:checked');
        const cesRating = cesRatingInput ? cesRatingInput.className : null;

        // Get the text from the comment box
        const commentText = document.getElementById('commentText').value;

        // Log the gathered inputs
        console.log('Star Rating:', starRating);
        console.log('CES Rating:', cesRating);
        console.log('Comment:', commentText);

        // Check if all required inputs are present
        if (starRating && cesRating) {
            sendCesRating(starRating, cesRating, commentText); // Send the data to the API
        } else {
            console.log('Please make sure all required inputs are filled.');
        }

        // Show the post-feedback message
        widget.style.display = "none";
        post.style.display = "block";
    }

    // Function to send the combined rating and comment to the API
    function sendCesRating(starRating, cesRating, comment) {
        const token = getQueryParam('token'); // Get the token from the URL
        const issueKey = getQueryParam('issue-key');
        
        if (!token || !issueKey) {
            console.error("Required parameters are missing.");
            return;
        }

        const data = {
            token: token,
            rating: starRating,
            cesRating: cesRating,
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

    // Attach the event listener to the submit button
    submitBtn.addEventListener('click', submitReview);

    // Handle change of feedback form
    changeBtn.onclick = () => {
        widget.style.display = "block";
        post.style.display = "none";
    };
});

// Utility function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

}

document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.querySelector(".submitBtn button");
    const post = document.querySelector(".post");
    const widget = document.querySelector(".rating-widget");
    const changeBtn = document.querySelector(".change");

    function submitReview(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way

        // Get the selected star rating
        const starRatingInput = document.querySelector('input[name="rate"]:checked');
        const starRating = starRatingInput ? starRatingInput.id.split('-')[1] : null;

        // Get the selected radio button for CES
        const cesRatingInput = document.querySelector('.radio-group input[name="rating"]:checked');
        const cesRating = cesRatingInput ? cesRatingInput.className : null;

        // Get the text from the comment box
        const commentText = document.getElementById('commentText').value;

        // Log the gathered inputs
        console.log('Star Rating:', starRating);
        console.log('CES Rating:', cesRating);
        console.log('Comment:', commentText);

        // Check if all required inputs are present
        if (starRating && cesRating) {
            sendCesRating(starRating, cesRating, commentText); // Send the data to the API
        } else {
            console.log('Please make sure all required inputs are filled.');
        }

        // Show the post-feedback message
        widget.style.display = "none";
        post.style.display = "block";
    }

    // Function to send the combined rating and comment to the API
    function sendCesRating(starRating, cesRating, comment) {
        const token = getQueryParam('token'); // Get the token from the URL
        const issueKey = getQueryParam('issue-key');
        
        if (!token || !issueKey) {
            console.error("Required parameters are missing.");
            return;
        }

        comment = cesRating + "\n" + comment;

        console.log(comment)

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

    // Attach the event listener to the submit button
    submitBtn.addEventListener('click', submitReview);

    // Handle change of feedback form
    changeBtn.onclick = () => {
        widget.style.display = "block";
        post.style.display = "none";
    };
});

// Utility function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

