import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function filterEmailsByQuery(emails: string[], query: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/); // Zerlege den Suchbegriff in Wörter

    const uniqueEmails = Array.from(new Set(emails));

    return uniqueEmails.filter((email) => {
        const [username, domain] = email.split('@');
        const emailParts = `${username.toLowerCase()} ${domain.toLowerCase()}`; // Kombiniere Benutzername und Domain

        return queryWords.some((word) => emailParts.includes(word));
    });
}

async function scrapeEmails(query: string): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(2000); // Warte 2 Sekunden

        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map((a) => a.href)
                .filter((href) => href.startsWith('http') && !href.includes('bing.com'));
        });

        const allEmails: Set<string> = new Set();
        for (const link of links) {
            try {
                const response = await axios.get(link, { timeout: 10000 });
                const $ = cheerio.load(response.data);

                const pageContent = $.html(); // Gesamter Seiteninhalt
                const emails = pageContent.match(emailRegex);

                if (emails) {
                    emails.forEach((email) => allEmails.add(email));
                }
            } catch (error) {
                // @ts-ignore
                console.error(`Fehler beim Öffnen der Seite ${link}:`, error.message);
            }
        }
        return filterEmailsByQuery(Array.from(allEmails), query);
    } finally {
        await browser.close();
    }
}

// Hauptfunktion
(async () => {
    const query = 'SSV Reutlingen'; // Beispiel-Suchanfrage
    const emails = await scrapeEmails(query);

    console.log('Gefundene E-Mail-Adressen:', emails);
})();
