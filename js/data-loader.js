class DataLoader {
    constructor() {
        this.cache = {};
    }

    async loadJSON(url) {
        if (this.cache[url]) {
            return this.cache[url];
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.cache[url] = data;
            return data;
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            return null;
        }
    }

    async loadModels() {
        return await this.loadJSON('data/models.json');
    }

    async loadPublications() {
        return await this.loadJSON('data/publications.json');
    }

    async loadTeamData() {
        return await this.loadJSON('data/team.json');
    }

    renderModelCard(model) {
        const tagsHTML = model.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        return `
            <div class="card">
                <h3 class="card-title">${model.title}</h3>
                <p class="card-meta">${model.meta}</p>
                <p class="card-description">${model.description}</p>
                <div class="tags">${tagsHTML}</div>
                <a href="${model.link}" class="card-link">Get Access</a>
            </div>
        `;
    }

    renderPublicationCard(publication) {
        const authorsHTML = publication.authors.join(', ');

        return `
            <div class="card">
                <h3 class="card-title">${publication.title}</h3>
                <p class="card-meta">${publication.journal} • ${publication.year}</p>
                <p class="card-description">${authorsHTML}</p>
                <p class="card-description">${publication.description}</p>
                <a href="${publication.link}" class="card-link">Read Publication</a>
            </div>
        `;
    }

    renderTeamMemberCard(member) {
        return `
            <div class="member-card">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-role">${member.role}</p>
                <p class="member-bio">${member.bio}</p>
            </div>
        `;
    }

    renderStats(stats) {
        return `
            <div class="stat-card">
                <div class="stat-number">${stats.publications}</div>
                <div class="stat-label">Publications</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.models}</div>
                <div class="stat-label">AI Models</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.researchers}</div>
                <div class="stat-label">Researchers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.collaborators}</div>
                <div class="stat-label">Collaborators</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.established}</div>
                <div class="stat-label">Established</div>
            </div>
        `;
    }

    renderAboutContent(labInfo) {
        const descriptionsHTML = labInfo.description.map(paragraph =>
            `<p class="about-text">${paragraph}</p>`
        ).join('');

        return descriptionsHTML;
    }

    async populateModels() {
        const models = await this.loadModels();
        if (!models) return;

        const modelsContainer = document.querySelector('#models .content-grid');
        if (modelsContainer) {
            modelsContainer.innerHTML = models.map(model => this.renderModelCard(model)).join('');
        }
    }

    async populatePublications() {
        const publications = await this.loadPublications();
        if (!publications) return;

        const publicationsContainer = document.querySelector('#papers .content-grid');
        if (publicationsContainer) {
            publicationsContainer.innerHTML = publications.slice().reverse().map(pub => this.renderPublicationCard(pub)).join('');
        }
    }

    async populateTeam() {
        const softwareData = await this.loadTeamData();
        if (!softwareData || !softwareData.teamMembers) return;

        const teamContainer = document.querySelector('#team .team-grid');
        if (teamContainer) {
            teamContainer.innerHTML = softwareData.teamMembers.map(member => this.renderTeamMemberCard(member)).join('');
        }
    }

    async populateStats() {
        const softwareData = await this.loadTeamData();
        if (!softwareData || !softwareData.stats) return;

        const statsContainer = document.querySelector('.stats-grid');
        if (statsContainer) {
            statsContainer.innerHTML = this.renderStats(softwareData.stats);
        }
    }

    async populateAbout() {
        const softwareData = await this.loadTeamData();
        if (!softwareData || !softwareData.labInfo) return;

        const aboutContainer = document.querySelector('.about-content');
        if (aboutContainer) {
            aboutContainer.innerHTML = this.renderAboutContent(softwareData.labInfo);
        }

        // Update header title and tagline
        const logoElement = document.querySelector('.logo');
        const taglineElement = document.querySelector('.tagline');

        if (logoElement) {
            logoElement.textContent = softwareData.labInfo.title;
            logoElement.setAttribute('data-text', softwareData.labInfo.title);
        }

        if (taglineElement) {
            taglineElement.textContent = softwareData.labInfo.tagline;
        }
    }

    async initialize() {
        try {
            await Promise.all([
                this.populateStats(),
                this.populateAbout(),
                this.populateModels(),
                this.populatePublications(),
                this.populateTeam()
            ]);
            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error initializing data:', error);
        }
    }
}

// Initialize the data loader when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dataLoader = new DataLoader();
    dataLoader.initialize();
});

// Make DataLoader available globally for potential future use
window.DataLoader = DataLoader;
