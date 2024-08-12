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
