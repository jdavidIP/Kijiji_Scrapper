const puppeteer = require('puppeteer');

// Function to delay execution for a given time
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to scrape a batch of pages
async function scrapeKijijiBatch(startPage, endPage) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Optimize resource usage by disabling images, stylesheets, and fonts
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
            request.abort();
        } else {
            request.continue();
        }
    });

    const baseUrl = "https://www.kijiji.ca/b-apartments-condos/kitchener-waterloo/";
    const listings = [];

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        const url = pageNum === 1 ? `${baseUrl}c37l1700212` : `${baseUrl}page-${pageNum}/c37l1700212`;

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
        } catch (error) {
            console.error(`Failed to load page ${url}:`, error);
            continue; // Skip this page and move on to the next one
        }

        const newResults = await page.evaluate(() => {
            const items = document.querySelectorAll('li[data-testid^="listing-card-list-item"]');
            return Array.from(items).map(item => {
                const titleElement = item.querySelector('h3[data-testid="listing-title"] a[data-testid="listing-link"]');
                const priceElement = item.querySelector('p[data-testid="listing-price"]');
                const locationElement = item.querySelector('p[data-testid="listing-location"]');
                const areaElement = item.querySelector('li[aria-label="Nearest intersection"] p');
                const descriptionElement = item.querySelector('p[data-testid="listing-description"]');
                const bedroomsElement = item.querySelector('li[aria-label="Bedrooms"] p');
                const bathroomsElement = item.querySelector('li[aria-label="Bathrooms"] p');
                const sizeElement = item.querySelector('li[aria-label="Size (sqft)"] p');
                const unitTypeElement = item.querySelector('li[aria-label="Unit type"] p');
                const parkingElement = item.querySelector('li[aria-label="Parking included"] p');
                const petsElement = item.querySelector('li[aria-label="Pets friendly"] p');

                return {
                    title: titleElement ? titleElement.innerText.trim() : 'Title not found',
                    price: priceElement ? priceElement.innerText.trim() : 'Price not found',
                    location: locationElement ? locationElement.innerText.trim() : 'Location not found',
                    area: areaElement ? areaElement.innerText.trim() : 'Area not found',
                    description: descriptionElement ? descriptionElement.innerText.trim() : 'Description not found',
                    bedrooms: bedroomsElement ? bedroomsElement.innerText.trim() : 'Bedrooms not found',
                    bathrooms: bathroomsElement ? bathroomsElement.innerText.trim() : 'Bathrooms not found',
                    size: sizeElement ? sizeElement.innerText.trim() : 'Size not found',
                    unitType: unitTypeElement ? unitTypeElement.innerText.trim() : 'Unit Type not found',
                    parking: parkingElement ? parkingElement.innerText.trim() : 'Parking not found',
                    petsFriendly: petsElement ? petsElement.innerText.trim() : 'Pets information not found'
                };
            });
        });

        listings.push(...newResults);

        // Introduce a delay between page requests to throttle the load
        await delay(1000); // 1 second delay
    }

    await browser.close();
    return listings;
}

async function scrapeAllListings(totalPages, batchSize) {
    const totalListings = { count: 0 }; // Shared variable for progress tracking

    // Calculate batch ranges
    const batchRanges = [];
    for (let i = 1; i <= totalPages; i += batchSize) {
        batchRanges.push([i, Math.min(i + batchSize - 1, totalPages)]);
    }

    // Run all batches sequentially
    const allListings = [];
    for (const [startPage, endPage] of batchRanges) {
        const batchListings = await scrapeKijijiBatch(startPage, endPage);
        allListings.push(...batchListings);
    }

    return allListings;
}

// Define the total number of pages and batch size
const TOTAL_PAGES = 44;
const BATCH_SIZE = 10; 

// Run the scraper and log the output
scrapeAllListings(TOTAL_PAGES, BATCH_SIZE)
    .then(listings => {
        console.log(JSON.stringify(listings, null, 2));
    })
    .catch(error => console.error('Error scraping listings:', error));