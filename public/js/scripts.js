document.getElementById('scrapeKijijiBtn').addEventListener('click', function() {
    fetch('../api/kijiji.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status !== 'success') {
                throw new Error('API response status not success.');
            }

            const listings = data.data.data;

            if (!Array.isArray(listings)) {
                throw new Error('Expected an array but got something else.');
            }

            const tbody = document.getElementById('listingsBody');
            tbody.innerHTML = ''; // Clear any existing rows

            listings.forEach((listing, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${listing.title}</td>
                    <td>${listing.price}</td>
                    <td>${listing.bathrooms}</td>
                    <td>${listing.bedrooms}</td>
                    <td>${listing.location}</td>
                    <td><button class="toggleDetails" data-index="${index}">Show Details</button></td>
                `;
                tbody.appendChild(tr);

                const trExpanded = document.createElement('tr');
                trExpanded.classList.add('expanded');
                trExpanded.innerHTML = `
                    <td colspan="6">
                        <div>
                            <strong>Area:</strong> ${listing.area} <br>
                            <strong>Size:</strong> ${listing.size} <br>
                            <strong>Unit Type:</strong> ${listing.unitType} <br>
                            <strong>Parking:</strong> ${listing.parking} <br>
                            <strong>Pet Friendly:</strong> ${listing.petsFriendly} <br>
                            <strong>Description:</strong> ${listing.description} <br>
                        </div>
                    </td>
                `;
                tbody.appendChild(trExpanded);

                tr.querySelector('.toggleDetails').addEventListener('click', function() {
                    trExpanded.classList.toggle('visible');
                    this.textContent = trExpanded.classList.contains('visible') ? 'Hide Details' : 'Show Details';
                });
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
});
