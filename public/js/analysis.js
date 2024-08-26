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
        unitTypeTitle.addEventListener('click', toggleDropdown); // Add toggle function
        unitTypeDiv.appendChild(unitTypeTitle);

        const unitTypePrice = document.createElement('span');
        unitTypePrice.textContent = `Average Price: $${unitTypeData.averagePrice}`;
        unitTypeTitle.appendChild(unitTypePrice);

        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        filtersContainer.style.display = 'none'; // Hide initially
        unitTypeDiv.appendChild(filtersContainer);

        // Create and append filter elements dynamically
        createFilters(filtersContainer, unitTypeData.listings);

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

// Function to create and append filter elements (bedrooms, bathrooms, parking, etc.)
function createFilters(container, listings) {
  const maxBedrooms = Math.max(...listings.map(listing => parseInt(listing.bedrooms, 10) || 0));
  const maxBathrooms = Math.max(...listings.map(listing => parseInt(listing.bathrooms, 10) || 0));
  const maxParking = Math.max(...listings.map(listing => parseInt(listing.parking, 10) || 0));

  // Create Bedrooms Filter
  const bedroomsLabel = document.createElement('label');
  bedroomsLabel.textContent = 'Bedrooms:';
  container.appendChild(bedroomsLabel);

  const bedroomsSelect = document.createElement('select');
  for (let i = 1; i <= maxBedrooms; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} bedroom${i > 1 ? 's' : ''}`;
    bedroomsSelect.appendChild(option);
  }
  container.appendChild(bedroomsSelect);

  // Create Bathrooms Filter
  const bathroomsLabel = document.createElement('label');
  bathroomsLabel.textContent = 'Bathrooms:';
  container.appendChild(bathroomsLabel);

  const bathroomsSelect = document.createElement('select');
  for (let i = 1; i <= maxBathrooms; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} bathroom${i > 1 ? 's' : ''}`;
    bathroomsSelect.appendChild(option);
  }
  container.appendChild(bathroomsSelect);

  // Create Parking Filter
  const parkingLabel = document.createElement('label');
  parkingLabel.textContent = 'Parking:';
  container.appendChild(parkingLabel);

  const parkingSelect = document.createElement('select');
  for (let i = 0; i <= maxParking; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} parking space${i > 1 ? 's' : ''}`;
    parkingSelect.appendChild(option);
  }
  container.appendChild(parkingSelect);

  // Create Pets Friendly Filter
  const petsLabel = document.createElement('label');
  petsLabel.textContent = 'Pets Friendly:';
  container.appendChild(petsLabel);

  const petsSelect = document.createElement('select');
  ['Yes', 'No'].forEach(optionValue => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    petsSelect.appendChild(option);
  });
  container.appendChild(petsSelect);

  // Apply Filters Button
  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply Filters';
  applyButton.className = 'apply-button';
  applyButton.addEventListener('click', () => {
    updateFilteredPrice(container, listings, {
      bedrooms: bedroomsSelect.value,
      bathrooms: bathroomsSelect.value,
      parking: parkingSelect.value,
      petsFriendly: petsSelect.value
    });
  });
  container.appendChild(applyButton);

  // Clear Filters Button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear Filters';
  clearButton.className = 'clear-button';
  clearButton.addEventListener('click', () => {
    bedroomsSelect.selectedIndex = 0;
    bathroomsSelect.selectedIndex = 0;
    parkingSelect.selectedIndex = 0;
    petsSelect.selectedIndex = 0;
    updateFilteredPrice(container, listings, {
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      petsFriendly: 'No'
    });
  });
  container.appendChild(clearButton);
}

// Function to update the price based on selected filters
function updateFilteredPrice(container, listings, filters) {
  const filteredListings = listings.filter(listing => {
    return (
      parseInt(listing.bedrooms, 10) >= filters.bedrooms &&
      parseInt(listing.bathrooms, 10) >= filters.bathrooms &&
      parseInt(listing.parking, 10) >= filters.parking &&
      (filters.petsFriendly === 'Yes' ? listing.petsFriendly === "Yes" : true)
    );
  });

  const averagePrice = calculateAveragePrice(filteredListings);
  const priceSpan = container.querySelector('.filtered-price');

  if (!priceSpan) {
    const newPriceSpan = document.createElement('span');
    newPriceSpan.className = 'filtered-price';
    newPriceSpan.textContent = `Filtered Avg Price: $${averagePrice}`;
    container.appendChild(newPriceSpan);
  } else {
    priceSpan.textContent = `Filtered Avg Price: $${averagePrice}`;
  }
}

// Initialize dropdowns and populate the structure on page load
populateDropdowns();
