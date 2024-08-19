

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
    const data = {
        token: token,
        rating: starRating,
        comment: radioButtonValue
    };
  
    fetch('https://glia.atlassian.net/rest/servicedesk/1/customer/feedback/portal/4/${issueKey}', {
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
    return starRating ? starRating.value : null;
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
          const radioButtonValue = radioButton.value;
          if (starRating) {
            sendApiRequest(starRating, radioButtonValue);
          } else {
            console.log('Please select a star rating first.');
          }
        });
      });
}
