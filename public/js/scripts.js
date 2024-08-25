document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    const pagination = document.getElementById('pagination');
    const itemsPerPage = 20; // Number of items to display per page
    let listings = []; // This will hold all the listings
    let currentPage = 1;

    // Fetch all listings from the backend
    function fetchAllListings() {
        loading.classList.add('active'); // Show loading spinner

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

                listings = data.data.data;
                displayPage(1); // Display the first page
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            })
            .finally(() => {
                loading.classList.remove('active'); // Hide loading spinner
            });
    }

    // Display a specific page of listings
    function displayPage(pageNum) {
        const startIndex = (pageNum - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageListings = listings.slice(startIndex, endIndex);

        const tbody = document.getElementById('listingsBody');
        tbody.innerHTML = ''; // Clear any existing rows

        pageListings.forEach((listing, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${listing.title}</td>
                <td>${listing.price}</td>
                <td>${listing.bathrooms}</td>
                <td>${listing.bedrooms}</td>
                <td>${listing.location}</td>
                <td><button class="toggleDetails" data-index="${startIndex + index}">Show Details</button></td>
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

        currentPage = pageNum;
        updatePagination();
    }

    // Update the pagination buttons
    function updatePagination() {
        const totalPages = Math.ceil(listings.length / itemsPerPage);
        pagination.innerHTML = `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="displayPage(${currentPage - 1})">Previous</button>
            ${[...Array(totalPages).keys()].map(i => 
                `<button ${currentPage === i + 1 ? 'class="active"' : ''} onclick="displayPage(${i + 1})">${i + 1}</button>`).join('')}
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="displayPage(${currentPage + 1})">Next</button>
        `;
    }

    fetchAllListings(); // Start by fetching all listings

});
