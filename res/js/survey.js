let rating = 0;
const stars = document.querySelectorAll('.star');
stars.forEach(star => {
    star.onclick = () => {
        rating = star.dataset.value;
        stars.forEach(s => {
            s.style.color = s.dataset.value <= rating ? 'gold' : 'gray';
        });
    };
});

function submitReview() {
    const reviewText = document.getElementById('reviewText').value;
    console.log('Rating:', rating, 'Review:', reviewText);
    // Here you can add code to send data to a server
}
