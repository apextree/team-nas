let refreshInterval = null;

function initializeApp() {
    console.log("News app initialized");
    initializeSearch();
    setupEventListeners();
    
    // Load settings and apply them
    const settings = loadSettings();
    
    // Set initial active category
    setActiveCategory(settings.defaultCategory);
    
    // Fetch initial news
    fetchNews(settings.defaultCategory);
    
    // Apply auto-refresh if set
    applySettings(settings);
}

function setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Fetch news for selected category
            fetchNews(category);
        });
    });

    // Settings button listener
    const settingsBtn = document.getElementById('settings-button');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // Overlay listener
    const overlay = document.getElementById('settings-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeSettings);
    }
}

function setActiveCategory(category) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initializeSearch() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-news');

    if (!searchButton || !searchInput) {
        console.error('Search elements not found');
        return;
    }

    // Function to perform search
    const performSearch = () => {
        const searchTerm = searchInput.value.trim();
        const activeCategory = document.querySelector('.filter-btn.active')?.getAttribute('data-category') || 'business';
        
        // Show loading state
        const newsList = document.querySelector('.news-list');
        if (newsList) {
            newsList.innerHTML = '<div class="loading">Searching news...</div>';
        }

        // Build API URL
        const apiUrl = `/apps/news/fetch?category=${activeCategory}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch news');
                }
                
                if (!data.data || data.data.length === 0) {
                    newsList.innerHTML = '<div class="no-results">No results found</div>';
                    return;
                }
                
                renderNews(data.data);
            })
            .catch(error => {
                console.error('Search error:', error);
                if (newsList) {
                    newsList.innerHTML = `
                        <div class="error-message">
                            Failed to search news. Please try again later.
                            <br><small>${error.message}</small>
                        </div>
                    `;
                }
            });
    };

    // Handle search button click
    searchButton.addEventListener('click', performSearch);

    // Handle Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Handle input clearing
    searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            const activeCategory = document.querySelector('.filter-btn.active')?.getAttribute('data-category') || 'business';
            fetchNews(activeCategory);
        }
    });

    // Clear search when changing categories
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            searchInput.value = '';
        });
    });
}

function fetchNews(category, searchTerm = '') {
    console.log(`Fetching news for category: ${category}, search: ${searchTerm}`);
    
    const newsList = document.querySelector('.news-list');
    if (!newsList) return;

    // Show loading state
    newsList.innerHTML = '<div class="loading">Loading news...</div>';

    // Update the last refresh time
    updateRefreshTime();
    
    // Build the API URL
    let apiUrl = `/apps/news/fetch?category=${category}`;
    if (searchTerm) {
        apiUrl += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch news');
            }
            
            if (!data.data || data.data.length === 0) {
                newsList.innerHTML = '<div class="no-results">No news items found</div>';
                return;
            }
            
            renderNews(data.data);
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsList.innerHTML = `
                <div class="error-message">
                    Failed to load news. Please try again later.
                    <br><small>${error.message}</small>
                </div>
            `;
        });
}

function renderNews(articles) {
    console.log('Rendering news with data:', articles); // Add this for debugging
    const newsList = document.querySelector('.news-list');
    
    if (!Array.isArray(articles) || articles.length === 0) {
        newsList.innerHTML = '<div class="no-results">No news items found.</div>';
        return;
    }

    newsList.innerHTML = articles.map(item => `
        <div class="news-item">
            <div class="news-title">${item.title || 'Untitled'}</div>
            ${item.urlToImage || item.imageUrl ? `
                <div class="news-image">
                    <img src="${item.urlToImage || item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">
                </div>
            ` : ''}
            <div class="news-content">${item.description || item.content || 'No content available'}</div>
            <div class="news-meta">
                <span>${new Date(item.publishedAt || item.date).toLocaleDateString()}</span>
                ${item.url || item.readMoreUrl ? `
                    <a href="${item.url || item.readMoreUrl}" target="_blank" class="read-more">Read More</a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function cleanupApp() {
    console.log('News app cleanup');
}

window.initializeApp = initializeApp;
window.cleanupApp = cleanupApp;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('news-root')) {
        initializeApp();
    }
});

function openSettings() {
    const modal = document.getElementById('settings-modal');
    const overlay = document.getElementById('settings-overlay');
    if (modal && overlay) {
        // Load current settings into form
        const settings = loadSettings();
        
        const refreshSelect = document.getElementById('refresh-interval');
        const categorySelect = document.getElementById('default-category');
        
        if (refreshSelect) refreshSelect.value = settings.refreshInterval;
        if (categorySelect) categorySelect.value = settings.defaultCategory;

        modal.style.display = 'block';
        overlay.style.display = 'block';
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    const overlay = document.getElementById('settings-overlay');
    if (modal && overlay) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }
}

function saveSettings() {
    const refreshIntervalSelect = document.getElementById('refresh-interval');
    const defaultCategorySelect = document.getElementById('default-category');

    const settings = {
        refreshInterval: refreshIntervalSelect ? refreshIntervalSelect.value : '0',
        defaultCategory: defaultCategorySelect ? defaultCategorySelect.value : 'business'
    };

    localStorage.setItem('newsSettings', JSON.stringify(settings));
    applySettings(settings);
    closeSettings();
}

function loadSettings() {
    const defaultSettings = {
        refreshInterval: '0',
        defaultCategory: 'business'
    };

    try {
        const savedSettings = localStorage.getItem('newsSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
        console.error('Error loading settings:', error);
        return defaultSettings;
    }
}

function applySettings(settings) {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }

    // Set up new refresh interval if needed
    const interval = parseInt(settings.refreshInterval);
    if (interval > 0) {
        refreshInterval = setInterval(() => {
            const activeButton = document.querySelector('.filter-btn.active');
            const activeCategory = activeButton ? 
                activeButton.getAttribute('data-category') : 
                settings.defaultCategory;
            
            fetchNews(activeCategory);
        }, interval);
    }
}

function updateRefreshTime() {
    const timeElement = document.getElementById('update-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
    }
}

window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;

// Add this new function to handle category changes
function changeCategory(category) {
    setActiveCategory(category);
    fetchNews(category);
}
