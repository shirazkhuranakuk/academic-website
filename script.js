const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function renderStats() {
  const el = $("#quickStats");
  el.innerHTML = siteContent.stats.map(stat => `
    <div class="stat">
      <strong>${stat.value}</strong>
      <span>${stat.label}</span>
    </div>
  `).join("");
}

function renderResearch() {
  const el = $("#researchGrid");
  el.innerHTML = siteContent.researchInterests.map(item => `
    <article class="info-card">
      <div class="icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `).join("");
}

function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index++;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === "," && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") index++;
      currentRow.push(currentValue.trim());
      if (currentRow.some(value => value !== "")) rows.push(currentRow);
      currentRow = [];
      currentValue = "";
    } else {
      currentValue += character;
    }
  }

  if (currentValue || currentRow.length) {
    currentRow.push(currentValue.trim());
    if (currentRow.some(value => value !== "")) rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headings = rows[0].map(heading =>
    heading.trim().replace(/^\uFEFF/, "")
  );

  return rows.slice(1).map(row => {
    const record = {};
    headings.forEach((heading, index) => {
      record[heading] = row[index] || "";
    });
    return record;
  });
}

let publicationsPromise = null;

async function loadPublications() {
  if (publicationsPromise) return publicationsPromise;

  publicationsPromise = (async () => {
    try {
      const response = await fetch("data/csv/publications.csv", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load publications.csv: ${response.status}`);
      }

      const csvText = await response.text();
      const records = parseCSV(csvText).filter(item => item.title);

      siteContent.publications = records;
    } catch (error) {
      console.warn(
        "publications.csv could not be loaded. Publications require a web server or hosted website.",
        error
      );
    }

    return Array.isArray(siteContent.publications) ? siteContent.publications : [];
  })();

  return publicationsPromise;
}

function renderPublications(filter = "all") {
  const el = $("#publicationList");
  if (!el) return;

  const normalisePublicationType = (type = "") => {
    const cleaned = String(type).trim().toLowerCase().replace(/[\s_-]+/g, "");
    const aliases = {
      journalarticle: "journal",
      journalpaper: "journal",
      conferencepaper: "conference",
      proceedingpaper: "conference",
      bookchapter: "bookchapter",
      chapter: "bookchapter",
      authoredbook: "book",
      editedbook: "book",
      patents: "patent",
      copyrights: "copyright"
    };
    return aliases[cleaned] || cleaned;
  };

  const selectedFilter = normalisePublicationType(filter);
  const records = Array.isArray(siteContent.publications) ? siteContent.publications : [];

  const items = records
    .filter(item => {
      const itemType = normalisePublicationType(item.type);
      if (selectedFilter === "all") return true;
      if (selectedFilter === "book") {
        return itemType === "book" || itemType === "bookchapter";
      }
      return itemType === selectedFilter;
    })
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

  if (!items.length) {
    el.innerHTML = `<p class="empty-message">No publications are currently listed in this category.</p>`;
    return;
  }

  const typeLabels = {
    journal: "Journal Article",
    conference: "Conference Paper",
    bookchapter: "Book Chapter",
    book: "Book",
    patent: "Patent",
    copyright: "Copyright"
  };

  el.innerHTML = items.map(item => {
    const itemType = normalisePublicationType(item.type);
    const displayedLabel = item.label || typeLabels[itemType] || item.type || "Publication";
    const bookName = item.bookTitle || item.book || "";
    const viewLabel =
      itemType === "conference" &&
      String(item.publisher || "").toLowerCase() === "ieee"
        ? "View on IEEE Xplore"
        : "View Publication";

    return `
      <article class="timeline-item publication-card">
        <div class="year">${item.year || ""}</div>
        <div class="publication-content">
          <h3>${item.title || "Untitled publication"}</h3>
          ${item.authors ? `<p class="publication-authors">${item.authors}</p>` : ""}
          ${item.venue ? `<p class="publication-venue">${item.venue}</p>` : ""}
          ${bookName ? `<p class="publication-venue">In: <strong>${bookName}</strong></p>` : ""}
          ${item.chapter ? `<p class="publication-details">${item.chapter}</p>` : ""}
          ${item.editors ? `<p class="publication-details">Editors: ${item.editors}</p>` : ""}
          ${item.publisher || item.pages ? `<p class="publication-details">${item.publisher || ""}${item.publisher && item.pages ? " · " : ""}${item.pages ? `pp. ${item.pages}` : ""}</p>` : ""}
          ${item.isbn ? `<p class="publication-details">ISBN: ${item.isbn}</p>` : ""}
          <div class="publication-meta">
            ${item.indexing ? `<span class="publication-tag">${item.indexing}</span>` : ""}
            ${item.publicationUrl ? `<a href="${item.publicationUrl}" target="_blank" rel="noopener noreferrer">${viewLabel}</a>` : ""}
            ${item.doi ? `<a href="${item.doi}" target="_blank" rel="noopener noreferrer">DOI</a>` : ""}
            ${item.paperFile ? `<a href="${item.paperFile}" target="_blank" rel="noopener noreferrer">View Document</a>` : ""}
            ${item.certificateFile ? `<a href="${item.certificateFile}" target="_blank" rel="noopener noreferrer">Certificate</a>` : ""}
          </div>
        </div>
        <span class="badge">${displayedLabel}</span>
      </article>
    `;
  }).join("");
}

let supervisionPromise = null;

async function loadSupervision() {
  if (supervisionPromise) return supervisionPromise;
  supervisionPromise = (async () => {
    try {
      const response = await fetch("data/csv/supervision.csv", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load supervision.csv: ${response.status}`);
      siteContent.studentSupervision = parseCSV(await response.text())
        .filter(item => item.title && item.student);
    } catch (error) {
      console.warn("supervision.csv could not be loaded.", error);
    }
    return Array.isArray(siteContent.studentSupervision) ? siteContent.studentSupervision : [];
  })();
  return supervisionPromise;
}

function renderSupervision(filter = "all") {
  const container = $("#supervisionGrid");
  const summary = $("#supervisionSummary");

  if (!container || !summary) {
    return;
  }

  const records = Array.isArray(siteContent.studentSupervision)
    ? siteContent.studentSupervision
    : [];

  const filteredRecords = records
    .filter(record => filter === "all" || record.level === filter)
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

  const counts = records.reduce((accumulator, record) => {
    accumulator[record.level] = (accumulator[record.level] || 0) + 1;
    return accumulator;
  }, {});

  summary.innerHTML = `
    <span><strong>${records.length}</strong> Total records</span>
    <span><strong>${counts["PhD"] || 0}</strong> PhD</span>
    <span><strong>${counts["M.Tech"] || 0}</strong> M.Tech</span>
    <span><strong>${counts["B.Tech"] || 0}</strong> B.Tech</span>
    <span><strong>${counts["Internship"] || 0}</strong> Internships</span>
  `;

  if (!filteredRecords.length) {
    container.innerHTML = `
      <p class="empty-message">
        No supervision records are available in this category.
      </p>
    `;
    return;
  }

  container.innerHTML = filteredRecords.map((record, index) => {
    const isOpen = index === 0;
    const panelId = `supervision-panel-${filter}-${index}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    const statusClass = String(record.status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `
      <article class="supervision-row ${isOpen ? "open" : ""}">
        <button
          class="supervision-row-button"
          type="button"
          aria-expanded="${isOpen ? "true" : "false"}"
          aria-controls="${panelId}"
        >
          <span class="supervision-row-text">
            <span class="supervision-row-name">
              ${record.student || "Student name not specified"}
            </span>
            <span class="supervision-row-meta">
              ${record.programme || record.level || ""}
              ${record.year ? ` · ${record.year}` : ""}
            </span>
            <span class="supervision-row-title">
              ${record.title || "Research title not specified"}
            </span>
          </span>

          <span class="supervision-row-badges">
            ${record.level ? `<span class="level-badge">${record.level}</span>` : ""}
            ${record.status ? `<span class="status-badge status-${statusClass}">${record.status}</span>` : ""}
            <span class="supervision-row-toggle" aria-hidden="true">+</span>
          </span>
        </button>

        <div
          class="supervision-row-panel"
          id="${panelId}"
          ${isOpen ? "" : "hidden"}
        >
          <div class="supervision-table">
            <div class="supervision-table-row">
              <div class="supervision-table-label">Student</div>
              <div class="supervision-table-value">${record.student || ""}</div>
            </div>

            <div class="supervision-table-row">
              <div class="supervision-table-label">Programme</div>
              <div class="supervision-table-value">${record.programme || ""}</div>
            </div>

            <div class="supervision-table-row">
              <div class="supervision-table-label">Year</div>
              <div class="supervision-table-value">${record.year || ""}</div>
            </div>

            <div class="supervision-table-row">
              <div class="supervision-table-label">Role</div>
              <div class="supervision-table-value">${record.role || ""}</div>
            </div>

            <div class="supervision-table-row">
              <div class="supervision-table-label">Research area</div>
              <div class="supervision-table-value">${record.area || ""}</div>
            </div>

            ${
              record.tools
                ? `
                  <div class="supervision-table-row">
                    <div class="supervision-table-label">Tools</div>
                    <div class="supervision-table-value">${record.tools}</div>
                  </div>
                `
                : ""
            }

            ${
              record.outcome
                ? `
                  <div class="supervision-table-row supervision-table-outcome">
                    <div class="supervision-table-label">Outcome</div>
                    <div class="supervision-table-value">${record.outcome}</div>
                  </div>
                `
                : ""
            }
          </div>

          <div class="supervision-links">
            ${record.dissertationFile ? `<a href="${record.dissertationFile}" target="_blank" rel="noopener">Dissertation</a>` : ""}
            ${record.publicationUrl ? `<a href="${record.publicationUrl}" target="_blank" rel="noopener">Publication</a>` : ""}
            ${record.presentationFile ? `<a href="${record.presentationFile}" target="_blank" rel="noopener">Presentation</a>` : ""}
            ${record.repositoryUrl ? `<a href="${record.repositoryUrl}" target="_blank" rel="noopener">Repository</a>` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");

  $$(".supervision-row-button", container).forEach(button => {
    button.addEventListener("click", () => {
      const selectedRow = button.closest(".supervision-row");
      const selectedPanel = selectedRow.querySelector(".supervision-row-panel");
      const wasOpen = selectedRow.classList.contains("open");

      $$(".supervision-row", container).forEach(row => {
        row.classList.remove("open");
        row.querySelector(".supervision-row-button")
          .setAttribute("aria-expanded", "false");
        row.querySelector(".supervision-row-panel").hidden = true;
      });

      if (!wasOpen) {
        selectedRow.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        selectedPanel.hidden = false;
      }
    });
  });
}

function initSupervisionFilters() {
  $$(".supervision-filter").forEach(button => {
    button.addEventListener("click", () => {
      $$(".supervision-filter").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderSupervision(button.dataset.supervisionFilter);
    });
  });
}


function getDownloadCategoryLabel(category = "") {
  const labels = {
    "question-paper": "Previous Year Question Paper",
    notes: "Notes",
    presentation: "Presentation",
    other: "Other Resource"
  };
  return labels[category] || "Resource";
}

function parseDownloadCSV(csvText) {
  return parseCSV(csvText).filter(resource => resource.title && resource.file);
}

let downloadResourcesPromise = null;

async function loadDownloadResources() {
  if (downloadResourcesPromise) return downloadResourcesPromise;

  downloadResourcesPromise = (async () => {
    try {
      const response = await fetch("data/csv/downloads.csv", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load downloads.csv: ${response.status}`);
      }

      const csvText = await response.text();
      const csvResources = parseDownloadCSV(csvText);

      if (csvResources.length) {
        siteContent.downloads = csvResources;
      }
    } catch (error) {
      console.warn(
        "downloads.csv could not be loaded. Using the fallback entries from content.js.",
        error
      );
    }

    return Array.isArray(siteContent.downloads) ? siteContent.downloads : [];
  })();

  return downloadResourcesPromise;
}

function renderDownloads(filter = "all") {
  const grid = $("#studentDownloadGrid");
  if (!grid) return;

  const downloads = Array.isArray(siteContent.downloads) ? siteContent.downloads : [];
  const items = downloads.filter(item => filter === "all" || item.category === filter);

  if (!items.length) {
    grid.innerHTML = `<p class="empty-message">No files are currently available in this category.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <article class="student-download-card">
      <div class="student-download-card-top">
        <span class="resource-type-badge">${getDownloadCategoryLabel(item.category)}</span>
        <span class="file-type-badge">${item.fileType || item.type || "File"}</span>
      </div>
      <h3>${item.title || "Untitled resource"}</h3>
      <dl class="download-details">
        ${item.subject ? `<div><dt>Subject</dt><dd>${item.subject}</dd></div>` : ""}
        ${item.courseCode ? `<div><dt>Course code</dt><dd>${item.courseCode}</dd></div>` : ""}
        ${item.semester ? `<div><dt>Semester</dt><dd>${item.semester}</dd></div>` : ""}
        ${item.year ? `<div><dt>Year</dt><dd>${item.year}</dd></div>` : ""}
        ${item.fileSize ? `<div><dt>File size</dt><dd>${item.fileSize}</dd></div>` : ""}
      </dl>
      ${item.description ? `<p class="download-description">${item.description}</p>` : ""}
      <div class="download-card-actions">
        <a href="${item.file}" target="_blank" rel="noopener noreferrer">View</a>
        <a href="${item.file}" download>Download</a>
      </div>
    </article>
  `).join("");
}

async function unlockDownloads() {
  const accessCard = $("#downloadAccessCard");
  const protectedArea = $("#protectedDownloads");
  if (!accessCard || !protectedArea) return;

  protectedArea.hidden = false;
  protectedArea.setAttribute("aria-busy", "true");

  const grid = $("#studentDownloadGrid");
  if (grid) {
    grid.innerHTML = `<p class="empty-message">Loading resources...</p>`;
  }

  await loadDownloadResources();

  accessCard.hidden = true;
  protectedArea.removeAttribute("aria-busy");
  renderDownloads();

  if (siteContent.downloadAccess?.rememberForSession !== false) {
    sessionStorage.setItem("studentDownloadsUnlocked", "true");
  }
}

function lockDownloads() {
  const accessCard = $("#downloadAccessCard");
  const protectedArea = $("#protectedDownloads");
  const passwordInput = $("#downloadPassword");
  const message = $("#downloadMessage");

  if (protectedArea) protectedArea.hidden = true;
  if (accessCard) accessCard.hidden = false;
  if (passwordInput) passwordInput.value = "";
  if (message) message.textContent = "";
  sessionStorage.removeItem("studentDownloadsUnlocked");
}

function initProtectedDownloads() {
  const form = $("#downloadLoginForm");
  const lockButton = $("#lockDownloads");

  if (!form) return;

  if (sessionStorage.getItem("studentDownloadsUnlocked") === "true") {
    unlockDownloads();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const passwordInput = $("#downloadPassword");
    const message = $("#downloadMessage");
    const enteredPassword = passwordInput?.value || "";
    const correctPassword = siteContent.downloadAccess?.password || "";

    if (enteredPassword === correctPassword) {
      if (message) message.textContent = "";
      await unlockDownloads();
    } else {
      if (message) message.textContent = "Incorrect password. Please try again.";
      if (passwordInput) {
        passwordInput.select();
        passwordInput.focus();
      }
    }
  });

  if (lockButton) lockButton.addEventListener("click", lockDownloads);

  $$(".download-filter").forEach(button => {
    button.addEventListener("click", () => {
      $$(".download-filter").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderDownloads(button.dataset.downloadFilter);
    });
  });
}

let activitiesPromise = null;

async function loadActivities() {
  if (activitiesPromise) return activitiesPromise;

  activitiesPromise = (async () => {
    try {
      const response = await fetch("data/csv/activities.csv", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load activities.csv: ${response.status}`);

      const records = parseCSV(await response.text())
        .filter(item => item.category && item.title);

      const grouped = {};
      records.forEach(item => {
        const category = String(item.category).trim();
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
      });

      siteContent.activities = Object.entries(grouped).map(([title, items]) => ({
        title,
        items
      }));
    } catch (error) {
      console.warn("activities.csv could not be loaded.", error);
    }

    return Array.isArray(siteContent.activities) ? siteContent.activities : [];
  })();

  return activitiesPromise;
}

function renderActivities() {
  const container = $("#activityAccordion");
  if (!container) return;

  const activities = Array.isArray(siteContent.activities)
    ? siteContent.activities
    : [];

  if (!activities.length) {
    container.innerHTML = `<p class="empty-message">No activities are currently listed.</p>`;
    return;
  }

  container.innerHTML = activities.map((activity, index) => `
    <article class="accordion-item ${index === 0 ? "open" : ""}">
      <button
        class="accordion-button"
        type="button"
        aria-expanded="${index === 0 ? "true" : "false"}"
      >
        <span>${activity.title}</span>
        <span aria-hidden="true">+</span>
      </button>

      <div class="accordion-content">
        <div class="activity-list">
          ${activity.items.map(item => {
            const details = [
              item.year,
              item.organisation,
              item.location,
              item.date
            ].filter(value => String(value || "").trim()).join(" · ");

            const filePath = String(item.file || "").trim();
            const externalUrl = String(item.url || "").trim();

            return `
              <article class="activity-entry">
                <div class="activity-entry-content">
                  <strong>${item.title}</strong>
                  ${details ? `<p class="activity-entry-meta">${details}</p>` : ""}
                  ${item.description ? `<p class="activity-entry-description">${item.description}</p>` : ""}
                </div>

                ${(externalUrl || filePath) ? `
                  <div class="activity-entry-links">
                    ${externalUrl ? `
                      <a href="${externalUrl}" target="_blank" rel="noopener noreferrer">
                        View Link
                      </a>
                    ` : ""}

                    ${filePath ? `
                      <a href="${filePath}" target="_blank" rel="noopener noreferrer">
                        View Certificate
                      </a>
                      <a href="${filePath}" download>
                        Download Certificate
                      </a>
                    ` : ""}
                  </div>
                ` : ""}
              </article>
            `;
          }).join("")}
        </div>
      </div>
    </article>
  `).join("");

  $$(".accordion-button", container).forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".accordion-item");
      const isOpen = item.classList.toggle("open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
}

let projectsPromise = null;

async function loadProjects() {
  if (projectsPromise) return projectsPromise;
  projectsPromise = (async () => {
    try {
      const response = await fetch("data/csv/projects.csv", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load projects.csv: ${response.status}`);
      siteContent.projects = parseCSV(await response.text()).filter(item => item.title);
    } catch (error) {
      console.warn("projects.csv could not be loaded.", error);
    }
    return Array.isArray(siteContent.projects) ? siteContent.projects : [];
  })();
  return projectsPromise;
}

function renderProjects() {
  const el = $("#projectGrid");
  if (!el) return;
  const records = Array.isArray(siteContent.projects) ? siteContent.projects : [];

  if (!records.length) {
    el.innerHTML = `<p class="empty-message">No projects are currently listed.</p>`;
    return;
  }

  el.innerHTML = records.map(project => `
    <article class="project-card">
      <div class="project-meta">
        <span>${project.status || ""}</span>
        <span>${project.year || ""}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description || ""}</p>
      ${project.fundingAgency ? `<p><strong>Funding agency:</strong> ${project.fundingAgency}</p>` : ""}
      ${project.budget ? `<p><strong>Budget:</strong> ${project.budget}</p>` : ""}
      ${project.projectUrl ? `<a href="${project.projectUrl}" target="_blank" rel="noopener">View project</a>` : ""}
    </article>
  `).join("");
}

function initNavigation() {
  const toggle = $(".menu-toggle");
  const nav = $(".main-nav");

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  $$(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initFilters() {
  $$(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      $$(".filter-btn").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderPublications(button.dataset.filter);
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  renderStats();
  renderResearch();

  const publicationList = $("#publicationList");
  if (publicationList) {
    publicationList.innerHTML = `<p class="empty-message">Loading publications...</p>`;
  }

  await Promise.all([
    loadPublications(),
    loadSupervision(),
    loadActivities(),
    loadProjects()
  ]);

  renderPublications();
  renderSupervision();
  renderActivities();
  renderProjects();

  initNavigation();
  initFilters();
  initSupervisionFilters();
  initProtectedDownloads();

  const yearElement = $("#year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
