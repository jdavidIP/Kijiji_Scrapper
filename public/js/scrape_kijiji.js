const puppeteer = require('puppeteer');

async function scrapeKijiji() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const baseUrl = "https://www.kijiji.ca/b-apartments-condos/kitchener-waterloo/";
    const listings = [];
    let pageNum = 1;

    while (pageNum < 3) {
        const url = pageNum === 1 ? `${baseUrl}c37l1700212` : `${baseUrl}page-${pageNum}/c37l1700212`;

        await page.goto(url, { waitUntil: 'networkidle2' });

        const newResults = await page.evaluate(() => {
            const items = document.querySelectorAll('li[data-testid^="listing-card-list-item"]');
            return Array.from(items).map(item => {
                const titleElement = item.querySelector('h3[data-testid="listing-title"] a[data-testid="listing-link"]');
                const priceElement = item.querySelector('p[data-testid="listing-price"]');
                const locationElement = item.querySelector('p[data-testid="listing-location"]');
                const descriptionElement = item.querySelector('p[data-testid="listing-description"]');
                const bedroomsElement = item.querySelector('li[aria-label="Bedrooms"] p');
                const bathroomsElement = item.querySelector('li[aria-label="Bathrooms"] p');
                const sizeElement = item.querySelector('li[aria-label="Size (sqft)"] p');
                const petsElement = item.querySelector('li[aria-label="Pets friendly"] p');

                return {
                    title: titleElement ? titleElement.innerText.trim() : 'Title not found',
                    price: priceElement ? priceElement.innerText.trim() : 'Price not found',
                    location: locationElement ? locationElement.innerText.trim() : 'Location not found',
                    description: descriptionElement ? descriptionElement.innerText.trim() : 'Description not found',
                    bedrooms: bedroomsElement ? bedroomsElement.innerText.trim() : 'Bedrooms not found',
                    bathrooms: bathroomsElement ? bathroomsElement.innerText.trim() : 'Bathrooms not found',
                    size: sizeElement ? sizeElement.innerText.trim() : 'Size not found',
                    petsFriendly: petsElement ? petsElement.innerText.trim() : 'Pets information not found'
                };
            });
        });

        if (newResults.length === 0) break;

        listings.push(...newResults);
        pageNum++;
    }

    await browser.close();
    return listings;
}

// If called directly, run the scraper and log the output
scrapeKijiji().then(listings => console.log(JSON.stringify(listings, null, 2)));
