document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    const pagination = document.getElementById('pagination');
    const itemsPerPage = 30; // Number of items to display per page
    let listings = []; // This will hold all the listings
    let filteredListings = []; // This will hold filtered listings
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
                filteredListings = listings; // Initially, all listings are shown
                displayPage(1); // Display the first page
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            })
            .finally(() => {
                loading.classList.remove('active'); // Hide loading spinner
            });
    }

    // Apply filters
    function applyFilters() {
        const bedrooms = parseInt(document.getElementById('bedrooms').value, 10);
        const bathrooms = parseInt(document.getElementById('bathrooms').value, 10);
        const maxPrice = parseFloat(document.getElementById('price').value);
        const location = document.getElementById('location').value.toLowerCase();
        const area = document.getElementById('area').value.toLowerCase();
        const pets = document.getElementById('pets').value.toLowerCase();
        const unitType = document.getElementById('unitType').value.toLowerCase();
        const parking = parseInt(document.getElementById('parking').value, 10);
    
        filteredListings = listings.filter(listing => {
            const listingPrice = parseFloat(listing.price.replace(/[$,]/g, ''));
            return (
                (isNaN(bedrooms) || parseInt(listing.bedrooms) === bedrooms) &&
                (isNaN(bathrooms) || parseInt(listing.bathrooms) === bathrooms) &&
                (isNaN(maxPrice) || listingPrice <= maxPrice) &&
                (location === "" || listing.location.toLowerCase().includes(location)) &&
                (area === "" || listing.area.toLowerCase().includes(area)) &&
                (pets === "" || listing.petsFriendly.toLowerCase() === pets) &&
                (unitType === "" || listing.unitType.toLowerCase() === unitType) &&
                (isNaN(parking) || parseInt(listing.parking) === parking)
            );
        });
    
        displayPage(1); // Reset to the first page after filtering
    }
    

    // Clear all filters
    function clearFilters() {
        document.getElementById('bedrooms').value = '';
        document.getElementById('bathrooms').value = '';
        document.getElementById('price').value = '';
        document.getElementById('location').value = '';
        document.getElementById('area').value = '';
        document.getElementById('pets').value = '';
        document.getElementById('unitType').value = '';
        document.getElementById('parking').value = '';

        filteredListings = listings; // Reset to all listings
        displayPage(1); // Reset to the first page
    }

    function displayPage(pageNum) {
        const startIndex = (pageNum - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageListings = filteredListings.slice(startIndex, endIndex);
    
        const tbody = document.getElementById('listingsBody');
        tbody.innerHTML = ''; // Clear any existing rows
    
        pageListings.forEach((listing, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${listing.title}</td>
                <td>${listing.price}</td>
                <td>${listing.bedrooms}</td>
                <td>${listing.bathrooms}</td>
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
                        <strong>Description:</strong> ${listing.description} <a href="${listing.link}">See Listing</a><br>

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
        updateAveragePrice(); // Call function to update average price
    }
    
    function updateAveragePrice() {
        if (filteredListings.length === 0) {
            document.getElementById('averagePrice').textContent = 'Average Price: N/A';
            return;
        }
    
        const total = filteredListings.reduce((sum, listing) => {
            const price = parseFloat(listing.price.replace(/[$,]/g, ''));
            return sum + (isNaN(price) ? 0 : price);
        }, 0);
    
        const average = total / filteredListings.length;
        document.getElementById('averagePrice').textContent = `Average Price: $${average.toFixed(2)}`;
    }
    
    // Update the pagination buttons
    function updatePagination() {
        const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
        pagination.innerHTML = ''; // Clear existing pagination buttons
    
        const visiblePages = 5; // Number of page buttons to display at a time
        let startPage = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
        let endPage = Math.min(startPage + visiblePages - 1, totalPages);
    
        // Adjust start and end pages if we're near the end
        if (endPage - startPage < visiblePages - 1) {
            startPage = Math.max(endPage - visiblePages + 1, 1);
        }
    
        // First page button (<<)
        const firstButton = document.createElement('button');
        firstButton.innerHTML = '&laquo;'; // << symbol
        firstButton.disabled = currentPage === 1;
        firstButton.addEventListener('click', () => displayPage(1));
        pagination.appendChild(firstButton);
    
        // Previous button (<)
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&lt;'; // < symbol
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => displayPage(currentPage - 1));
        pagination.appendChild(prevButton);
    
        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => displayPage(i));
            pagination.appendChild(pageButton);
        }
    
        // Next button (>)
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&gt;'; // > symbol
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => displayPage(currentPage + 1));
        pagination.appendChild(nextButton);
    
        // Last page button (>>)
        const lastButton = document.createElement('button');
        lastButton.innerHTML = '&raquo;'; // >> symbol
        lastButton.disabled = currentPage === totalPages;
        lastButton.addEventListener('click', () => displayPage(totalPages));
        pagination.appendChild(lastButton);
    }

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    document.getElementById('analyzeButton').addEventListener('click', function() {
        const queryParams = new URLSearchParams();
    
        queryParams.append('bedrooms', document.getElementById('bedrooms').value);
        queryParams.append('bathrooms', document.getElementById('bathrooms').value);
        queryParams.append('price', document.getElementById('price').value);
        queryParams.append('location', document.getElementById('location').value);
        queryParams.append('area', document.getElementById('area').value);
        queryParams.append('pets', document.getElementById('pets').value);
        queryParams.append('unitType', document.getElementById('unitType').value);
        queryParams.append('parking', document.getElementById('parking').value);
    
        // Store the filtered listings in localStorage
        localStorage.setItem('filteredListings', JSON.stringify(filteredListings));
    
        window.location.href = 'analysis.html?' + queryParams.toString();
    });
    
    

    fetchAllListings(); // Start by fetching all listings
});
