class Bragdoc {
    constructor() {
        this.docs = [];
        this.currentDoc = null;
        this.page = 1;
        this.perPage = 10;
    }

    async init() {
        await this.loadDocs();
        this.handleRoute();
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    async loadDocs() {
        try {
            const res = await fetch('/api/docs/full');
            if (res.ok) {
                this.docs = await res.json();
            }
        } catch (err) {
            console.error('Failed to load docs:', err);
        }
    }

    async loadDoc(filename) {
        const doc = this.docs.find((d) => d.filename === filename);
        if (doc) {
            this.currentDoc = doc;
            this.renderDoc();
            window.location.hash = filename.replace('.md', '');
        }
    }

    handleRoute() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const filename = hash.endsWith('.md') ? hash : `${hash}.md`;
            const doc = this.docs.find((d) => d.filename === filename);
            if (doc) {
                this.loadDoc(filename);
                return;
            }
        }
        this.currentDoc = null;
        this.page = 1;
        this.render();
    }

    formatPeriod(period) {
        const parts = period.split('-');
        if (parts.length < 2) return period;
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);

        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }

    render() {
        const metaEl = document.getElementById('meta');
        const sectionsEl = document.getElementById('sections');

        document.title = 'Oleg Kamlowski — Brag Doc';
        metaEl.innerHTML = `<span class="doc-label">${this.docs.length} period${this.docs.length !== 1 ? 's' : ''}</span>`;
        sectionsEl.classList.remove('blog');

        if (this.docs.length === 0) {
            sectionsEl.innerHTML = `
        <div class="empty">
          <div class="empty-text">No brag docs yet</div>
          <div class="empty-hint">Add markdown files to your brags folder</div>
        </div>
      `;
            return;
        }

        const totalPages = Math.ceil(this.docs.length / this.perPage);
        const start = (this.page - 1) * this.perPage;
        const pageDocs = this.docs.slice(start, start + this.perPage);

        sectionsEl.innerHTML = `
      <div class="divider"></div>
      <div class="doc-list">
        ${pageDocs
            .map(
                (doc, i) => `
          <article class="doc-entry" data-filename="${doc.filename}" style="animation-delay: ${i * 60}ms">
            <header class="doc-entry-header">
              <div class="doc-entry-meta">
                <span class="doc-period">${this.formatPeriod(doc.period)}</span>
                ${doc.role ? `<span class="doc-entry-role">${doc.role}</span>` : ''}
              </div>
            </header>
            <div class="doc-entry-content">
              ${doc.sections
                  .map(
                      (section) => `
                <div class="entry-section">
                  <h3 class="entry-section-title">${section.title}</h3>
                  <div class="entry-section-content">${section.content}</div>
                </div>
              `,
                  )
                  .join('')}
            </div>
          </article>
        `,
            )
            .join('')}
      </div>
      ${
          totalPages > 1
              ? `
        <div class="pagination">
          <button class="page-btn" onclick="app.prevPage()" ${this.page === 1 ? 'disabled' : ''}>
            ← Previous
          </button>
          <span class="page-info">${this.page} / ${totalPages}</span>
          <button class="page-btn" onclick="app.nextPage()" ${this.page === totalPages ? 'disabled' : ''}>
            Next →
          </button>
        </div>
      `
              : ''
      }
    `;

        requestAnimationFrame(() => {
            sectionsEl.querySelectorAll('.doc-entry').forEach((item) => {
                item.classList.add('visible');
                item.addEventListener('click', () => {
                    this.loadDoc(item.dataset.filename);
                });
            });
        });
    }

    prevPage() {
        if (this.page > 1) {
            this.page--;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.docs.length / this.perPage);
        if (this.page < totalPages) {
            this.page++;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    renderDoc() {
        const metaEl = document.getElementById('meta');
        const sectionsEl = document.getElementById('sections');

        const periodLabel = this.formatPeriod(this.currentDoc.period);
        document.title = `${periodLabel} — Oleg Kamlowski`;
        metaEl.innerHTML = `
      <span class="meta-period">${periodLabel}</span>
      ${this.currentDoc.role ? `<span class="meta-role">${this.currentDoc.role}</span>` : ''}
      <button class="back-btn" onclick="app.goBack()">← All periods</button>
    `;
        sectionsEl.classList.add('blog');

        sectionsEl.innerHTML = `
      <div class="divider"></div>
      ${this.currentDoc.sections
          .map(
              (section, i) => `
        <section class="section" style="animation-delay: ${200 + i * 100}ms">
          <div class="section-header">
            <span class="section-number">${String(section.number || i + 1).padStart(2, '0')}</span>
            <h2 class="section-title">${section.title}</h2>
          </div>
          <div class="section-content">${section.content}</div>
        </section>
      `,
          )
          .join('')}
    `;

        requestAnimationFrame(() => {
            sectionsEl
                .querySelectorAll('.section')
                .forEach((s) => s.classList.add('visible'));
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    goBack() {
        this.currentDoc = null;
        window.location.hash = '';
        this.render();
    }
}

const app = new Bragdoc();
document.addEventListener('DOMContentLoaded', () => app.init());
