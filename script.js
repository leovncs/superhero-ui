let heroes = [];
let filteredHeroes = [];
let currentPage = 1;
const itemsPerPage = 20;

async function loadHeroes() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">Carregando super-heróis...</div>';

    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json');
        if (!response.ok) throw new Error('Erro ao carregar dados');
        
        heroes = await response.json();
        filteredHeroes = heroes;
        
        populatePublisherFilter();
        renderPage();
    } catch (error) {
        content.innerHTML = '<div class="error">Erro ao carregar os dados. Tente novamente mais tarde.</div>';
        console.error('Erro:', error);
    }
}

function populatePublisherFilter() {
    const publishers = [...new Set(heroes.map(h => h.biography.publisher).filter(p => p))].sort();
    const select = document.getElementById('publisherFilter');
    
    publishers.forEach(publisher => {
        const option = document.createElement('option');
        option.value = publisher;
        option.textContent = publisher;
        select.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const publisher = document.getElementById('publisherFilter').value;
    const alignment = document.getElementById('alignmentFilter').value;

    filteredHeroes = heroes.filter(hero => {
        const matchesSearch = !searchTerm || 
            hero.name.toLowerCase().includes(searchTerm) ||
            (hero.biography.fullName && hero.biography.fullName.toLowerCase().includes(searchTerm));
        
        const matchesPublisher = !publisher || hero.biography.publisher === publisher;
        
        const matchesAlignment = !alignment || hero.biography.alignment === alignment;

        return matchesSearch && matchesPublisher && matchesAlignment;
    });

    currentPage = 1;
    renderPage();
}

function renderPage() {
    const content = document.getElementById('content');
    const resultsInfo = document.getElementById('resultsInfo');
    
    if (filteredHeroes.length === 0) {
        content.innerHTML = '<div class="no-results">Nenhum super-herói encontrado.</div>';
        resultsInfo.textContent = '';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(filteredHeroes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageHeroes = filteredHeroes.slice(startIndex, endIndex);

    resultsInfo.textContent = `Mostrando ${startIndex + 1}-${Math.min(endIndex, filteredHeroes.length)} de ${filteredHeroes.length} heróis`;

    const grid = document.createElement('div');
    grid.className = 'grid';

    pageHeroes.forEach(hero => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(hero);

        card.innerHTML = `
            <img src="${hero.images.sm}" alt="${hero.name}" class="card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22320%22%3E%3Crect width=%22280%22 height=%22320%22 fill=%22%23e0e0e0%22/%3E%3C/svg%3E'">
            <div class="card-content">
                <div class="card-title">${hero.name}</div>
                <div class="card-info">Nome completo: ${hero.biography.fullName || 'Desconhecido'}</div>
                <div class="card-info">Editora: ${hero.biography.publisher || 'Desconhecida'}</div>
            </div>
        `;

        grid.appendChild(card);
    });

    content.innerHTML = '';
    content.appendChild(grid);

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        renderPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    pagination.appendChild(prevBtn);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.textContent = '1';
        firstBtn.onclick = () => {
            currentPage = 1;
            renderPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'page-info';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            renderPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'page-info';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }

        const lastBtn = document.createElement('button');
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => {
            currentPage = totalPages;
            renderPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(lastBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próximo →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        currentPage++;
        renderPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    pagination.appendChild(nextBtn);
}

function openModal(hero) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    const stats = hero.powerstats;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${hero.images.sm}" alt="${hero.name}" class="modal-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect width=%22120%22 height=%22120%22 fill=%22%23e0e0e0%22/%3E%3C/svg%3E'">
            <div>
                <div class="modal-title">${hero.name}</div>
                <div class="modal-subtitle">${hero.biography.fullName || 'Nome completo desconhecido'}</div>
            </div>
        </div>
        <div class="modal-body">
            <h3 style="margin-bottom: 1rem;">Estatísticas</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Inteligência</div>
                    <div class="stat-value">${stats.intelligence || 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Força</div>
                    <div class="stat-value">${stats.strength || 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Velocidade</div>
                    <div class="stat-value">${stats.speed || 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Durabilidade</div>
                    <div class="stat-value">${stats.durability || 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Poder</div>
                    <div class="stat-value">${stats.power || 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Combate</div>
                    <div class="stat-value">${stats.combat || 'N/A'}</div>
                </div>
            </div>
            <h3 style="margin-bottom: 0.5rem;">Informações</h3>
            <p><strong>Editora:</strong> ${hero.biography.publisher || 'Desconhecida'}</p>
            <p><strong>Alinhamento:</strong> ${hero.biography.alignment === 'good' ? 'Herói' : hero.biography.alignment === 'bad' ? 'Vilão' : 'Neutro'}</p>
            <p><strong>Raça:</strong> ${hero.appearance.race || 'Desconhecida'}</p>
            <p><strong>Gênero:</strong> ${hero.appearance.gender || 'Desconhecido'}</p>
            <p><strong>Altura:</strong> ${hero.appearance.height[1] || 'Desconhecida'}</p>
            <p><strong>Peso:</strong> ${hero.appearance.weight[1] || 'Desconhecido'}</p>
            <p><strong>Ocupação:</strong> ${hero.work.occupation || 'Desconhecida'}</p>
        </div>
    `;

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('publisherFilter').addEventListener('change', applyFilters);
document.getElementById('alignmentFilter').addEventListener('change', applyFilters);

loadHeroes();