const https = require("https");

function req(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers
    };

    const r = https.request(options, res => {
      let data = "";
      res.on("data", c => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });

    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME;
  const pdfField = process.env.AIRTABLE_PDF_FIELD_NAME;
  const statusField = process.env.AIRTABLE_STATUS_FIELD_NAME;
  const recordId = process.env.RECORD_ID;
  const pdfName = process.env.PDF_NAME;

  if (!token) throw new Error("Missing AIRTABLE_TOKEN");
  if (!baseId) throw new Error("Missing AIRTABLE_BASE_ID");
  if (!table) throw new Error("Missing AIRTABLE_TABLE_NAME");
  if (!pdfField) throw new Error("Missing AIRTABLE_PDF_FIELD_NAME");
  if (!recordId) throw new Error("Missing RECORD_ID");
  if (!pdfName) throw new Error("Missing PDF_NAME");

  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
  const pdfUrl = `https://${owner}.github.io/${repo}/pdfs/${pdfName}.pdf`;

  const fields = {};
  fields[pdfField] = [{ url: pdfUrl }];
  if (statusField) fields[statusField] = "Done";

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${recordId}`;
  const body = JSON.stringify({ fields });

  const res = await req(
    "PATCH",
    url,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    },
    body
  );

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Airtable update failed ${res.status}: ${res.data}`);
  }

  console.log("Airtable updated with PDF URL:", pdfUrl);
})();
