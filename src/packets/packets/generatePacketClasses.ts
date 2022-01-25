import cheerio from 'cheerio';
import { request } from 'https';

const PROTOCOL_URL = 'https://wiki.vg/index.php?title=Protocol&oldid=17289';

function getProtocolHtml(): Promise<string> {
  return new Promise((resolve) => {
    let html = '';
    request(PROTOCOL_URL, (message) => {
      message.on('data', (data: string) => {
        html += data;
      });

      message.on('end', () => {
        resolve(html);
      });
    }).end();
  });
}

async function generateClasses() {
  const html = await getProtocolHtml();
  const $ = cheerio.load(html);
  const tables = [...$('h4 + table, h4 + p + table')]
    .filter(
      (table) => $('th:first-of-type', table).first().text().trim().toLowerCase() === 'packet id',
    )
    .map((element) => [$(element).prevUntil('h4').addBack().prev('h4').text(), element])
    .filter(([name]) => !!name);
  console.log(tables);
}

generateClasses();
