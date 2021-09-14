import express from 'express';
import puppeteer from 'puppeteer';
import absolutify from 'absolutify';

const app = express();

const splitedBitch = (url) => {
    return url.split('/')[0];
}

app.get('/', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            res.status(403).send("please provide a url");
        }
        else {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://${url}`);

            let document = await page.evaluate(() => document.documentElement.outerHTML);
            document = absolutify(document, `?${splitedBitch(url)}`);
            res.send(document)
        }
    } catch (err) {
        res.status(500).send(err);
    }
})

const port = process.env.PORT || 3001

app.listen(port, () => console.log(`listening on port: ${port}`))