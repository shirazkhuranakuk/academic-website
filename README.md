# Dr. Shiraz Khurana – Static Academic Website

## Files

- `index.html` – page structure and visible text
- `styles.css` – colours, layout and responsive design
- `content.js` – publications, activities, projects, research interests and statistics
- `script.js` – menu, filters and accordion behaviour
- `assets/profile-placeholder.svg` – replace with your profile photograph
- `assets/Resume.pdf` – add your actual CV using this exact filename

## How to edit regular updates

Most routine updates can be made in `content.js`.

### Add a publication

Copy one publication object and change its values:

```js
{
  year: "2026",
  type: "journal",
  title: "Your paper title",
  details: "Authors · Journal · Volume · DOI"
}
```

Allowed publication types:
- `journal`
- `conference`
- `book`
- `patent`

### Add an activity

In the `activities` list, add:

```js
{
  title: "Awards",
  items: ["Award name, organisation and year."]
}
```

### Replace profile photograph

Place your photograph in the `assets` folder, for example `profile.jpg`, and change this line in `index.html`:

```html
<img src="assets/profile-placeholder.svg" ...>
```

to:

```html
<img src="assets/profile.jpg" ...>
```

### Add your CV

Copy your CV into `assets` and rename it to:

`Resume.pdf`

### Update external profiles

In `index.html`, replace the `#` links for Google Scholar, LinkedIn and ORCID.

### Publish free of cost

You can upload this folder to:
- GitHub Pages
- Netlify
- Cloudflare Pages
- Your university web hosting

Open `index.html` locally to preview the website.


## Add another conference paper

Open `content.js` and add a new object inside `publications`:

```js
{
  year: "2026",
  type: "conference",
  title: "Paper title",
  authors: "Author One, Author Two and Shiraz Khurana",
  venue: "Full conference name",
  publisher: "IEEE",
  pages: "1–6",
  doi: "https://doi.org/...",
  indexing: "IEEE Xplore",
  publicationUrl: "https://ieeexplore.ieee.org/document/..."
}
```

Omit fields that are unavailable.


## Student supervision section

Edit records in `content.js` under `studentSupervision`. Dissertation PDFs can be stored under `assets/dissertations/PhD`, `assets/dissertations/MTech`, or `assets/dissertations/BTech`.


## Password-protected student downloads

The Downloads section is controlled through `content.js`. Change the password here:

```js
downloadAccess: {
  password: "GBU2026",
  rememberForSession: true
}
```

Add files to `assets/downloads/question-papers`, `notes`, `presentations`, or `other`, then add a matching record to the `downloads` array in `content.js`. This is a client-side gate for a static website and prevents casual access only.


## CSV-driven student downloads

The protected Downloads section now reads its resource list from `downloads.csv`.

### Routine for adding a resource

1. Copy the actual file into one of these folders:
   - `assets/downloads/question-papers/`
   - `assets/downloads/notes/`
   - `assets/downloads/presentations/`
   - `assets/downloads/other/`
2. Open `downloads.xlsx` and add one row.
3. Save/export the worksheet as **CSV UTF-8 (Comma delimited)** using the exact filename `downloads.csv`.
4. Replace the old `downloads.csv` in the website root.
5. Upload the new resource file and the updated CSV to your hosting.

Use only these category values: `question-paper`, `notes`, `presentation`, `other`.

### Local preview

Browsers normally block CSV loading when `index.html` is opened directly with a `file://` address. The website therefore retains the existing `content.js` download records as a fallback. To test the live CSV locally, run this command from the website folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.


## CSV-based publications

Publication records now come from `publications.csv`.

Maintain the records in `publications.xlsx`, and then export the Publications sheet as:

`CSV UTF-8 (Comma delimited)`

Use the exact filename:

`publications.csv`

Place it in the website root beside `index.html`.

Supported publication type values:

- `journal`
- `conference`
- `bookchapter`
- `book`
- `patent`
- `copyright`

The existing **Books & Chapters** filter displays both `book` and `bookchapter`.

Important: CSV loading works when the website is hosted or served through a local web server. For local testing:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.


## Unified Excel and CSV data structure

Maintain frequently updated content in one workbook:

`data/website-data.xlsx`

Worksheets:
- Publications
- Downloads
- Supervision
- Projects
- Activities

Export an edited worksheet as **CSV UTF-8 (Comma delimited)** to:

`data/csv/`

Exact filenames:
- `publications.csv`
- `downloads.csv`
- `supervision.csv`
- `projects.csv`
- `activities.csv`

The website reads the CSV files. The Excel workbook is the master editing file.

Local testing:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.
