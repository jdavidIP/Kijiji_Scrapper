document.addEventListener('DOMContentLoaded', function() {
    const insightsContainer = document.getElementById('insights');
    const backButton = document.getElementById('backButton');
    
    // Retrieve the filtered listings from localStorage
    const filteredListings = JSON.parse(localStorage.getItem('filteredListings'));

    if (!filteredListings || filteredListings.length === 0) {
        insightsContainer.textContent = 'No listings available for analysis.';
        return;
    }

    // Analyze and display insights
    displayInsights(filteredListings);

    // Back button functionality
    backButton.addEventListener('click', function() {
        window.history.back();
    });

    // Function to display insights
    function displayInsights(listings) {
        if (listings.length === 0) {
            insightsContainer.textContent = 'No listings match the selected filters.';
            return;
        }

        const total = listings.reduce((sum, listing) => {
            const price = parseFloat(listing.price.replace(/[$,]/g, ''));
            return sum + (isNaN(price) ? 0 : price);
        }, 0);

        const averagePrice = total / listings.length;

        // Display basic average price
        let insightsHTML = `<p>Average Price: $${averagePrice.toFixed(2)}</p>`;

        // Analyze by area
        const areas = {};
        listings.forEach(listing => {
            const area = listing.area || 'Unknown Area';
            const price = parseFloat(listing.price.replace(/[$,]/g, ''));
            if (!areas[area]) {
                areas[area] = { count: 0, totalPrice: 0 };
            }
            areas[area].count++;
            areas[area].totalPrice += isNaN(price) ? 0 : price;
        });

        insightsHTML += '<h3>Average Price by Area:</h3>';
        insightsHTML += '<ul>';
        for (const area in areas) {
            const avgAreaPrice = areas[area].totalPrice / areas[area].count;
            insightsHTML += `<li>${area}: $${avgAreaPrice.toFixed(2)} (Total Listings: ${areas[area].count})</li>`;
        }
        insightsHTML += '</ul>';

        // Further analysis can be done similarly for pets, unit type, parking, etc.
        // For example, analyze price variations based on whether the property is pet-friendly:
        const petFriendlyListings = listings.filter(listing => listing.petsFriendly.toLowerCase() === 'yes');
        const nonPetFriendlyListings = listings.filter(listing => listing.petsFriendly.toLowerCase() === 'no');

        const avgPetFriendlyPrice = petFriendlyListings.length
            ? petFriendlyListings.reduce((sum, listing) => sum + parseFloat(listing.price.replace(/[$,]/g, '')), 0) / petFriendlyListings.length
            : 0;

        const avgNonPetFriendlyPrice = nonPetFriendlyListings.length
            ? nonPetFriendlyListings.reduce((sum, listing) => sum + parseFloat(listing.price.replace(/[$,]/g, '')), 0) / nonPetFriendlyListings.length
            : 0;

        insightsHTML += '<h3>Price Comparison for Pet-Friendly Rentals:</h3>';
        insightsHTML += `<p>Pet-Friendly Average Price: $${avgPetFriendlyPrice.toFixed(2)}</p>`;
        insightsHTML += `<p>Non-Pet-Friendly Average Price: $${avgNonPetFriendlyPrice.toFixed(2)}</p>`;

        insightsContainer.innerHTML = insightsHTML;
    }
});
