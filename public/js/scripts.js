document.getElementById('scrapeKijijiBtn').addEventListener('click', function() {
    fetch('../api/kijiji.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('result').innerText = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
});