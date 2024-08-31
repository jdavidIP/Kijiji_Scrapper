// Assuming the data is stored in localStorage under the key 'filteredListings'
const data = JSON.parse(localStorage.getItem('filteredListings'));

// Step 1: Extract unique locations, areas, and unit types
const locations = [...new Set(data.map(listing => listing.location))];

// Structure data by location -> area -> unitType
const structuredData = locations.map(location => {
  const areas = [...new Set(data.filter(listing => listing.location === location)
                                .map(listing => listing.area))];

  return {
    location,
    areas: areas.map(area => {
      const unitTypes = [...new Set(data.filter(listing => listing.area === area)
                                         .map(listing => listing.unitType))];

      return {
        area,
        unitTypes: unitTypes.map(unitType => {
          const listings = data.filter(listing =>
            listing.area === area && listing.unitType === unitType
          );

          const averagePrice = calculateAveragePrice(listings);

          return { unitType, listings, averagePrice };
        })
      };
    })
  };
});

// Function to calculate average price for a set of listings
function calculateAveragePrice(listings) {
  const total = listings.reduce((sum, listing) => {
    const price = parseFloat(listing.price.replace(/[^0-9.-]+/g, ""));
    return sum + price;
  }, 0);
  return (total / listings.length).toFixed(2);
}

// Function to create and populate dropdowns dynamically
function populateDropdowns() {
  const locationContainer = document.getElementById('location-container');

  structuredData.forEach(locationData => {
    // Create and append the location dropdown
    const locationDiv = document.createElement('div');
    locationDiv.className = 'location';

    const locationTitle = document.createElement('h3');
    locationTitle.textContent = `${locationData.location}`;
    locationTitle.classList.add('location-title');
    locationTitle.addEventListener('click', toggleDropdown); // Add toggle function
    locationDiv.appendChild(locationTitle);

    const locationPrice = document.createElement('span');
    locationPrice.textContent = `Average Price: $${calculateAveragePrice(data.filter(listing => listing.location === locationData.location))}`;
    locationTitle.appendChild(locationPrice);

    const areaContainer = document.createElement('div');
    areaContainer.className = 'area-container';
    areaContainer.style.display = 'none'; // Hide initially
    locationDiv.appendChild(areaContainer);

    // Append areas
    locationData.areas.forEach(areaData => {
      const areaDiv = document.createElement('div');
      areaDiv.className = 'area';

      const areaTitle = document.createElement('h4');
      areaTitle.textContent = `${areaData.area}`;
      areaTitle.classList.add('area-title');
      areaTitle.addEventListener('click', toggleDropdown); // Add toggle function
      areaDiv.appendChild(areaTitle);

      const areaPrice = document.createElement('span');
      areaPrice.textContent = `Average Price: $${calculateAveragePrice(data.filter(listing => listing.area === areaData.area && listing.location === locationData.location))}`;
      areaTitle.appendChild(areaPrice);

      const unitTypeContainer = document.createElement('div');
      unitTypeContainer.className = 'unitType-container';
      unitTypeContainer.style.display = 'none'; // Hide initially
      areaDiv.appendChild(unitTypeContainer);

      // Append unit types
      areaData.unitTypes.forEach(unitTypeData => {
        const unitTypeDiv = document.createElement('div');
        unitTypeDiv.className = 'unitType';

        const unitTypeTitle = document.createElement('h5');
        unitTypeTitle.textContent = `${unitTypeData.unitType}`;
        unitTypeTitle.classList.add('unitType-title');
        unitTypeTitle.addEventListener('click', () => showListings(unitTypeData.listings, unitTypeDiv)); // Show listings on click
        unitTypeDiv.appendChild(unitTypeTitle);

        const unitTypePrice = document.createElement('span');
        unitTypePrice.textContent = `Average Price: $${unitTypeData.averagePrice}`;
        unitTypeTitle.appendChild(unitTypePrice);

        unitTypeContainer.appendChild(unitTypeDiv);
      });

      areaContainer.appendChild(areaDiv);
    });

    locationContainer.appendChild(locationDiv);
  });
}

// Toggle dropdown visibility
function toggleDropdown(event) {
  const nextElement = event.target.nextElementSibling;
  if (nextElement) {
    const isDisplayed = nextElement.style.display === 'block';
    nextElement.style.display = isDisplayed ? 'none' : 'block';
  }
}

// Function to display listings
function showListings(listings, container) {
  // Clear any existing listings
  const existingListings = container.querySelector('.listings');
  if (existingListings) {
    existingListings.remove();
  }

  // Create a new container for the listings
  const listingsContainer = document.createElement('div');
  listingsContainer.className = 'listings';
  listings.forEach(listing => {
    const listingDiv = document.createElement('div');
    listingDiv.className = 'listing';

    const listingTitle = document.createElement('h6');
    listingTitle.textContent = listing.title;
    listingDiv.appendChild(listingTitle);

    const listingDetails = document.createElement('p');
    listingDetails.innerHTML = `
      Price: ${listing.price}<br>
      Location: ${listing.location}<br>
      Area: ${listing.area}<br>
      Bedrooms: ${listing.bedrooms}<br>
      Bathrooms: ${listing.bathrooms}<br>
      Size: ${listing.size}<br>
      Parking: ${listing.parking}<br>
      Pets Friendly: ${listing.petsFriendly}<br>
      <a href="${listing.link}">View Listing</a>
    `;
    listingDiv.appendChild(listingDetails);

    listingsContainer.appendChild(listingDiv);
  });

  container.appendChild(listingsContainer);
}

// Initialize dropdowns and populate the structure on page load
populateDropdowns();
