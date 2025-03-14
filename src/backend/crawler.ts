// import puppeteer from 'puppeteer';
// import axios from 'axios';
// import * as cheerio from 'cheerio';
// import * as fs from 'fs';
// import * as path from 'path';
// import csv from 'csv-parser';
// import { writeToPath } from 'fast-csv';
//
// const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
//
// interface Company {
//     companyName: string;
//     city: string;
//     boardMember: string;
// }
//
// interface CrawledCompany {
//     companyName: string;
//     city: string;
//     boardMember: string;
//     Emails: string[];
//     GeneratedEmail: string;
//     exists: string;
// }
//
// function readCSV(filePath: string): Promise<Company[]> {
//     return new Promise((resolve, reject) => {
//         const results: Company[] = [];
//
//         fs.createReadStream(filePath)
//             .pipe(csv())
//             .on('data', (data: Company) => results.push(data))
//             .on('end', () => resolve(results))
//             .on('error', (error) => reject(error));
//     });
// }
//
// async function writeCSV(filePath: string, data: CrawledCompany[]): Promise<void> {
//     return new Promise((resolve, reject) => {
//         writeToPath(filePath, data, { headers: true, quoteColumns: true })
//             .on('finish', () => {
//                 console.log(`CSV-Datei wurde erfolgreich erstellt: ${filePath}`);
//                 resolve();
//             })
//             .on('error', (error) => {
//                 console.error('Fehler beim Schreiben der CSV-Datei:', error);
//                 reject(error);
//             });
//     });
// }
//
// function filterEmailsByQuery(emails: string[], query: string): string[] {
//     const queryWords = query.toLowerCase().split(/\s+/); // Zerlege den Suchbegriff in Wörter
//
//     const uniqueEmails = Array.from(new Set(emails));
//
//     return uniqueEmails.filter((email) => {
//         const [username, domain] = email.split('@');
//         const emailParts = `${username.toLowerCase()} ${domain.toLowerCase()}`; // Kombiniere Benutzername und Domain
//
//         return queryWords.some((word) => emailParts.includes(word));
//     });
// }
//
// export async function scrapeEmails(query: string): Promise<string[]> {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//
//     try {
//         const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
//         await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
//
//         const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
//         await delay(1000); // Warte 1 Sekunden
//
//         const links = await page.evaluate(() => {
//             const anchors = Array.from(document.querySelectorAll('a'));
//             return anchors
//                 .map((a) => a.href)
//                 .filter((href) => href.startsWith('http') && !href.includes('bing.com'));
//         });
//
//         const allEmails: Set<string> = new Set();
//         for (const link of links) {
//             try {
//                 const response = await axios.get(link, { timeout: 2500 });
//                 const $ = cheerio.load(response.data);
//
//                 const pageContent = $.html(); // Gesamter Seiteninhalt
//                 const emails = pageContent.match(emailRegex);
//
//                 if (emails) {
//                     emails.forEach((email) => allEmails.add(email));
//                 }
//             } catch (error) {
//                 console.error(`Fehler beim Öffnen der Seite ${link}:`, error);
//             }
//         }
//         return filterEmailsByQuery(Array.from(allEmails), query);
//     } finally {
//         await browser.close();
//     }
// }
//
// export function generateEmail(name: string, emails: string[]): string {
//     // Funktion zur Ersetzung von Umlauten
//     function replaceUmlauts(str: string): string {
//         return str.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
//     }
//
//     // Extrahiere die Domain aus der ersten E-Mail-Adresse
//     const domain = emails.length > 0 ? emails[0].split("@")[1] : "no-valid-email.de";
//     let nameParts = name.toLowerCase().split(" ");
//     nameParts = nameParts.map(replaceUmlauts);
//
//     // Prüfen, ob es personalisierte E-Mail-Adressen mit Initial + Nachname, Bindestrich oder Nachname+Initial gibt
//     const personalEmails = emails.filter(email => email.match(/^[a-z](-?[a-z]+)?\.[a-z]+@/) || email.match(/^[a-z]+[a-z]@/));
//     if (personalEmails.length > 0) {
//         if (emails.some(email => email.match(/^[a-z]\.[a-z]+@/))) {
//             return `${nameParts[0][0]}.${nameParts[1]}@${domain}`;
//         } else if (emails.some(email => email.match(/^[a-z]-[a-z]+@/))) {
//             return `${nameParts[0][0]}-${nameParts[1]}@${domain}`;
//         } else if (emails.some(email => email.match(/^[a-z]+[a-z]@/))) {
//             return `${nameParts[1]}${nameParts[0][0]}@${domain}`;
//         }
//     }
//
//     // Falls kein Schema erkennbar ist, Standard-Fallback
//     return `${nameParts.join(".")}@${domain}`;
// }
//
// export async function validateEmail(email: string): Promise<boolean> {
//     const browser = await puppeteer.launch({ headless: true }); // Headless-Modus für automatisierte Ausführung
//     const page = await browser.newPage();
//
//     try {
//         await page.goto('http://yahoo.com/', { waitUntil: 'networkidle2' });
//         await page.goto('http://email.perfectvalidation.com/', { waitUntil: 'networkidle2' });
//
//         // Eingabefeld für die E-Mail-Adresse auswählen und Wert eingeben
//         await page.type('#email', email);
//
//         // Warten, bis der Button aktiv wird
//         await page.waitForFunction(() => {
//             const btn = document.querySelector('#validateBtn');
//             return btn && !btn.hasAttribute('disabled');
//         });
//
//         // Auf den "Validate"-Button klicken
//         await page.click('#validateBtn');
//
//         // Warten, bis das "results"-Element erscheint oder überprüft werden kann
//         await page.waitForSelector('#results', { visible: true, timeout: 5000 }).catch(() => {});
//
//         // Überprüfen, ob das Element sichtbar ist
//         const isVisible = await page.evaluate(() => {
//             const resultsDiv = document.getElementById('results');
//             if (!resultsDiv) return false;
//             return window.getComputedStyle(resultsDiv).display !== 'none';
//         });
//
//         return isVisible;
//     } catch (error) {
//         console.error("Fehler beim Abrufen der Validierung:", error);
//         return false;
//     } finally {
//         await browser.close();
//     }
// }
//
// // Hauptfunktion
// // (async () => {
// //     const csvFilePath = path.join(__dirname, 'files/daten.csv');
// //
// //     let csvData: Company[];
// //     const crawledData: CrawledCompany[] = [];
// //
// //     try {
// //         csvData = await readCSV(csvFilePath);
// //         console.log('CSV-Daten erfolgreich geladen:', csvData);
// //
// //         for (const company of csvData) {
// //             const start = performance.now();
// //
// //             const query = company.companyName + " " + company.city;
// //             console.log("Start scraping for: " + query);
// //             const emails = await scrapeEmails(query);
// //             const validEmails = [];
// //
// //             console.log('Gefundene E-Mail-Adressen:', emails);
// //
// //             console.log('Checke auf Gültigkeit:');
// //             for (const email of emails) {
// //                 const isValid = await validateEmail(email);
// //                 console.log(`${email}: ${isValid ? 'gültig' : 'ungültig'}`);
// //                 if (isValid) {
// //                     validEmails.push(email);
// //                 }
// //             }
// //             const end = performance.now();
// //             console.log(`Dauer für crawlen: ${((end - start) / 1000).toFixed(2)} sec`);
// //
// //             console.log('Generiere personalisierte E-Mail-Adresse:');
// //             const generatedEmailAddress = generateEmail(company.boardMember, validEmails);
// //             const isValid = await validateEmail(generatedEmailAddress);
// //
// //             console.log(`${generatedEmailAddress}: ${isValid ? 'gültig' : 'ungültig'}`);
// //
// //             const crawledCompany: CrawledCompany = {
// //                 companyName: company.companyName,
// //                 city: company.city,
// //                 boardMember: company.boardMember,
// //                 Emails: validEmails,
// //                 GeneratedEmail: generatedEmailAddress,
// //                 exists: isValid ? 'Existiert vermutlich' : 'Existiert nicht'
// //             };
// //
// //             crawledData.push(crawledCompany);
// //         }
// //     } catch (error) {
// //         console.error('Fehler beim Einlesen der CSV-Datei:', error);
// //     }
// //
// //     Speichern der CSV-Datei
// // const csvOutputFilePath = path.join(__dirname, 'files/firmen_output.csv');
// //
// // await writeCSV(csvOutputFilePath, crawledData);
// // })();