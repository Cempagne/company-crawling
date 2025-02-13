import { Builder, By, Key, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import * as readline from "readline";

// Benutzerabfrage für Login-Bestätigung
const askUser = (question: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

async function chatWithGPT() {
    let driver = null;

    try {
        let options = new Options();
        options.addArguments(
            `--user-data-dir=C:\\Users\\ozwirks\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1`,
            `--profile-directory=Default`, // "Default", "Profile 1", ...
            "--disable-blink-features=AutomationControlled",
            "--start-maximized"
        );
        options.excludeSwitches(["enable-automation"]);
        options.addArguments(
            `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36`
        );

        driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();

        await driver.get("https://chat.openai.com/");

        console.log("Bitte bestätige, dass du eingeloggt bist und drücke Enter...");
        await askUser("Bist du eingeloggt? (Drücke Enter, um fortzufahren)");

        let chatInput = await driver.wait(until.elementLocated(By.xpath("//textarea")), 30000);
        await driver.wait(until.elementIsVisible(chatInput), 10000);
        await chatInput.click();

        await chatInput.sendKeys("Hallo, wie geht es dir?", Key.RETURN);
        await driver.sleep(5000);

        let messages = await driver.findElements(By.xpath("//div[contains(@class, 'message')]"));
        let lastMessage = await messages[messages.length - 1].getText();
        console.log("ChatGPT Antwort:", lastMessage);
    } catch (error) {
        console.error("Fehler im Skript:", error);
    } finally {
        if (driver) await driver.quit();
    }
}

chatWithGPT();
