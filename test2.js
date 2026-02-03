    /* ======================================
    BIBLE STUDY GROUP FINDER APP
    ====================================== */

    // Configuration
const CONFIG = {
    JSON_URLS: {
        members: "https://docs.google.com/spreadsheets/d/18qX5pLgXHv-4ZlNAw7SWSCtnrva65TwxycQOXuVuv9g/gviz/tq?tqx=out:json&sheet=members",
        pastors: "https://docs.google.com/spreadsheets/d/1gsibd4XwcGFEWfw3Na2VIjlEgwU30N741hUYugFO-JE/gviz/tq?tqx=out:json&sheet=pastors",    
    }
};


const SUBCOM_LEADERS = [
    { name: "DANIEL WALIAULA", year: "3", phone: "799134615", position: "CHAIRPERSON", group: "1" },
    { name: "SAMUEL MULI", year: "3", phone: "745977532", position: "VICE CHAIRPERSON", group: "1" },
    { name: "HELLET MWANGI", year: "1", phone: "750585272", position: "SECRETARY", group: "2" },
    { name: "MURITHI ABIGAIL", year: "3", phone: "707834817", position: "TREASURER", group: "2" },
    { name: "LUCY MUKAMI", year: "2", phone: "728653216", position: "ORGANIZING SECRETARY", group: "3" },
    { name: "VERONICA WANJIKU", year: "3", phone: "712626143", position: "EX-OFFICIAL", group: "3" },
    { name: "KERRY MWENDA", year: "1", phone: "793610856", position: "PRAYER REP.", group: "4" }
];



    const DEBUG = true;

    function log(...args) {
        if (DEBUG) console.log('[BibleApp]', ...args);
    }

    function logError(...args) {
        console.error('[BibleApp ERROR]', ...args);
    }

    // App State
    const appState = {
        currentRole: 'member',
        members: [],
        pastors: [],
        subcomLeaders: [],
        allData: null,
        searchQuery: '',
        showPhones: {}
    };

    // DOM Elements
    const elements = {
        roleButtons: document.querySelectorAll('.role-btn'),
        searchInput: document.getElementById('searchInput'),
        clearBtn: document.getElementById('clearBtn'),
        loadingState: document.getElementById('loadingState'),
        errorState: document.getElementById('errorState'),
        contentArea: document.getElementById('contentArea'),
        emptyState: document.getElementById('emptyState'),
        resultsContainer: document.getElementById('resultsContainer'),
        errorMessage: document.getElementById('errorMessage'),
        hamburger: document.getElementById('hamburger'),
        suggestionsDropdown: document.getElementById('suggestionsDropdown'),
        suggestionsList: document.getElementById('suggestionsList'),
        searchContainer: document.querySelector('.search-container')
    };

    // ======================================
    // UTILITY FUNCTIONS
    // ======================================

    function maskPhone(phone) {
        const cleaned = phone.toString().replace(/\D/g, '');
        if (cleaned.length < 10) return cleaned;
        const last3 = cleaned.slice(-3);
        return `07** *** ${last3}`;
    }

    function cleanPhone(phone) {
        let cleaned = phone.toString().trim().replace(/\D/g, '');
        
        // Handle Kenyan formats
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.slice(1);
        } else if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }
        
        return cleaned;
    }

//     function  cleanPhone(phone) {
//     if (!phone) return '';

//     let cleaned = phone.toString().trim().replace(/\D/g, '');

//     if (cleaned.startsWith('254')) {
//         return cleaned;
//     }

//     if (cleaned.startsWith('0')) {
//         return '254' + cleaned.slice(1);
//     }

//     if (cleaned.length === 9) {
//         return '254' + cleaned;
//     }

//     return cleaned;
// }

function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const rows = [];
        
        for (const line of lines) {
            // Handle quoted fields
            const fields = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    fields.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            fields.push(current.trim());
            rows.push(fields);
        }
        
        return rows;
    }

    function cleanName(name) {
        return name
            .replace(/\s+\d+$/, '')   // remove trailing numbers
            .replace(/\s{2,}/g, ' ')  // collapse double spaces
            .trim();
    }


    // ======================================
    // DATA PARSING FUNCTIONS
    // ======================================

    function parseMembers(csvText) {
        const rows = parseCSV(csvText);
        const members = [];
        
        // console.log('[parseMembers] Raw CSV rows:', rows.length);
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            // Skip header and empty rows
            if (row.length < 2 || !row[0]) continue;
            
        // Correct order: NAME, GROUP, YEAR, PHONE
            const name  = cleanName(row[0].trim());
            const group = row[1] ? row[1].trim() : '';
            const year  = row[2] ? row[2].trim() : '';
            const phone = row[3] ? row[3].trim() : '';

            
            // Require name and phone at minimum
            if (!name || !phone) {
                continue;
            }
            
            members.push({
                name,
                group: group || 'N/A',
                year: year || 'N/A',
                phone
            });
        }
        
        console.log(`[parseMembers] FINAL: Loaded ${members.length} members`);
        log('[parseMembers] Sample rows:', rows.slice(0, 5));

        return members;
    }


    function parsePastors(csvText) {
        const rows = parseCSV(csvText);
        const pastors = [];
        
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 4 || !row[0]) continue;
            
            const name = row[0].trim();
            const year = row[1] ? row[1].trim() : '';
            const group = row[2] ? row[2].trim() : '';
            const phone = row[3] ? row[3].trim() : '';
            
            if (name && phone && group) {
                pastors.push({
                    name,
                    year,
                    group,
                    phone
                });
            }
        }
        
        log('[parsePastors] Total CSV rows:', rows.length);
log('[parsePastors] Sample rows:', rows.slice(0, 5));
log('[parsePastors] Final pastors count:', pastors.length);

        return pastors;
    }


 function parseGoogleSheetResponse(text) {
    // Remove Google’s non-JSON prefix
    const jsonStr = text
        .replace(/^\/\*.*\*\//, '')       // remove /*O_o*/
        .replace(/^[^\(]*\(/, '')         // remove anything before first (
        .replace(/\);?$/, '');            // remove trailing );

    return JSON.parse(jsonStr);
}


    // ======================================
    // FETCH DATA
    // ======================================

    async function fetchAllData() {
    try {
        showLoadingState();
        
        log('Starting data fetch...');
// log('Members URL:', CONFIG.JSON_URLS.members);
// log('Pastors URL:', CONFIG.JSON_URLS.pastors);

        const [membersRes, pastorsRes] = await Promise.all([
            fetch(CONFIG.JSON_URLS.members),
            fetch(CONFIG.JSON_URLS.pastors)
        ]);
        log('Members fetch status:', membersRes.status);
log('Pastors fetch status:', pastorsRes.status);

        if (!membersRes.ok || !pastorsRes.ok) {
            throw new Error('Failed to fetch data');
        }

        const membersText = await membersRes.text();
        const pastorsText = await pastorsRes.text();

// log('[fetchAllData] Raw members text length:', membersText.length);
// log('[fetchAllData] Raw pastors text length:', pastorsText.length);

        // Convert the fetched text into proper JSON
        const membersJson = parseGoogleSheetResponse(membersText);
        const pastorsJson = parseGoogleSheetResponse(pastorsText);

//         log('[fetchAllData] Parsed members JSON rows:', membersJson.table.rows.length);
// log('[fetchAllData] Parsed pastors JSON rows:', pastorsJson.table.rows.length);

// appState.members = membersJson.table.rows
//     .map(row => ({
//         name: row.c[0]?.v || '',
//         group: row.c[2]?.v || '',
//         year: row.c[3]?.v || '',
//         phone: cleanPhone(row.c[4]?.v || '')
//     }))
//     // keep only real entries
//     .filter(m => m.name && m.phone);

appState.members = membersJson.table.rows
    .map(row => {
        const phone = cleanPhone(row.c[4]?.v || '');
        // log('[Mapping member] Name:', row.c[0]?.v, 'Phone:', phone);
        return {
            name: row.c[0]?.v || '',
            group: row.c[2]?.v || '',
            year: row.c[3]?.v || '',
            phone
        };
    })
    .filter(m => m.name && m.phone);


appState.pastors = pastorsJson.table.rows
    .map(row => ({
        name: row.c[0]?.v || '',
        year: row.c[1]?.v || '',
        group: row.c[2]?.v || '',
        phone: cleanPhone(row.c[3]?.v || '')
    }))
    .filter(p => p.name && p.phone && p.group);



    appState.subcomLeaders = SUBCOM_LEADERS.map(s => ({
        ...s,
        phone: cleanPhone(s.phone)
    }));


        appState.allData = true;

        hideLoadingState();
        renderResults();

    } catch (error) {
        console.error('Error fetching data:', error);
        showErrorState('Failed to load data. Please check your internet connection and try again.');
    }
}

    // ======================================
    // SEARCH FUNCTIONS
    // ======================================

function searchMembers(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase().trim().split(/\s+/);
// log('[searchMembers] Query:', query, 'Results found:', results.length);

    return appState.members.filter(member => {
        const nameWords = member.name.toLowerCase().split(/\s+/);
        return lowerQuery.every(qWord =>
            nameWords.some(nWord => nWord.startsWith(qWord))
        );
    });
    
}



function searchPastors(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase().trim().split(/\s+/);
// log('[searchPastors] Query:', query, 'Results found:', results.length);

    return appState.pastors.filter(pastor => {
        const nameWords = pastor.name.toLowerCase().split(/\s+/);
        return lowerQuery.every(qWord =>
            nameWords.some(nWord => nWord.startsWith(qWord))
        );
    });
}



    function scrollToSearch() {
        if (elements.searchContainer) {
            elements.searchContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus search input for better UX
            setTimeout(() => {
                elements.searchInput.focus();
            }, 500);
        }
    }

function generateSuggestions(query) {
    if (!query || query.trim().length < 1) {
        hideSuggestions();
        return;
    }

    const lowerWords = query.trim().toLowerCase().split(/\s+/);
    let suggestions = [];

    const filterFn = name => {
        const lowerName = name.toLowerCase();
        const nameWords = lowerName.split(/\s+/);
        // First, match all query words at the start of a name word
       const startsWithMatch = lowerWords.every(qWord =>
            nameWords.some(nWord => nWord.startsWith(qWord) || nWord.includes(qWord))
        );

        // If that fails, allow full name includes for partial middle/last name
        return startsWithMatch || lowerWords.every(qWord => lowerName.includes(qWord));
    };

    if (appState.currentRole === 'member') {
        suggestions = appState.members
            .filter(m => filterFn(m.name))
            .slice(0, 8)
            .map(m => ({
                name: m.name,
                type: 'member',
                meta: `Group ${m.group} • Year ${m.year}`,
                icon: 'member'
            }));
    } else {
        suggestions = appState.pastors
            .filter(p => filterFn(p.name))
            .slice(0, 8)
            .map(p => ({
                name: p.name,
                type: 'pastor',
                meta: `Group ${p.group}`,
                icon: 'pastor'
            }));
    }

    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    displaySuggestions(suggestions);
}



    function displaySuggestions(suggestions) {
        let html = '';
        
        for (const suggestion of suggestions) {
            const iconSvg = suggestion.icon === 'member' 
                ? '<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2"/><path d="M1 21C1 17.134 4.13401 14 8 14H10C13.866 14 17 17.134 17 21V21C17 21.5523 16.5523 22 16 22H2C1.44772 22 1 21.5523 1 21V21Z" stroke="currentColor" stroke-width="2"/></svg>'
                : '<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26H21.77L16.84 12.45L17.97 18.71L12 14.53L6.03 18.71L7.16 12.45L2.23 8.26H8.91L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
            
            html += `
                <div class="suggestion-item" onclick="selectSuggestion('${escapeHtml(suggestion.name)}')">
                    ${iconSvg}
                    <div class="suggestion-text">
                        <div class="suggestion-name">${escapeHtml(suggestion.name)}</div>
                        <div class="suggestion-meta">${escapeHtml(suggestion.meta)}</div>
                    </div>
                </div>
            `;
        }
        
        elements.suggestionsList.innerHTML = html;
        elements.suggestionsDropdown.style.display = 'block';
    }

    function hideSuggestions() {
        elements.suggestionsDropdown.style.display = 'none';
        elements.suggestionsList.innerHTML = '';
    }

    function selectSuggestion(name) {
        elements.searchInput.value = name;
        appState.searchQuery = name;
        hideSuggestions();
        renderResults();
    }

    function findPastorByGroup(groupNumber) {
        const normalizedGroup = String(groupNumber).trim();
        const pastor = appState.pastors.find(p => String(p.group).trim() === normalizedGroup);
        return pastor;
    }

    function findMembersByGroup(groupNumber) {
        const normalizedGroup = String(groupNumber).trim();
        const members = appState.members.filter(m => String(m.group).trim() === normalizedGroup);
        return members;
    }

    // ======================================
    // RENDER FUNCTIONS
    // ======================================

    function renderMemberSearchResults(members) {
        if (members.length === 0) {
            elements.resultsContainer.innerHTML = '';
            showEmptyState();
            return;
        }
        
        hideEmptyState();
        let html = '<div class="results-container">';
        
        for (const member of members) {
            const pastor = findPastorByGroup(member.group);
            const groupMembers = findMembersByGroup(member.group).filter(m => m.name !== member.name);
            const subcomLeaders = appState.subcomLeaders;

            
            html += `
                <div class="result-card member-card">
                    <!-- Member Badge -->
                    <div class="member-badge-section">
                        <span class="member-badge">${escapeHtml(member.name)}</span>
                    </div>
                    
                    <!-- Pastor Section (Main Focus) -->
                    <div class="pastor-section">
                        <h3 class="section-title">Your Pastor</h3>
                        ${pastor ? `
                            <div class="pastor-info-box">
                                <div class="pastor-header">
                                    <div class="pastor-avatar">
                                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26H21.77L16.84 12.45L17.97 18.71L12 14.53L6.03 18.71L7.16 12.45L2.23 8.26H8.91L12 2Z"/></svg>
                                    </div>
                                    <div class="pastor-name-info">
                                        <p class="pastor-name">${escapeHtml(pastor.name)}</p>
                                        <p class="pastor-year">Year ${pastor.year}</p>
                                    </div>
                                </div>
                                <div class="pastor-actions">
                                    <a href="https://wa.me/${pastor.phone}" target="_blank" class="btn-action btn-whatsapp-primary" title="Message on WhatsApp">
                                        <svg class="wa-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="currentColor"
                                                    d="M16 3C9.37 3 4 8.37 4 15c0 2.38.7 4.6 1.9 6.48L4 29l7.72-1.86A12.9 12.9 0 0 0 16 27c6.63 0 12-5.37 12-12S22.63 3 16 3zm0 22c-2.04 0-3.95-.6-5.55-1.62l-.4-.24-4.6 1.1 1.12-4.48-.26-.43A9.96 9.96 0 0 1 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.02-7.56c-.28-.14-1.64-.8-1.9-.9-.25-.1-.43-.14-.6.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.06-.28-.14-1.18-.44-2.24-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.42.12-.56.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.06-.34-.02-.48-.08-.14-.6-1.44-.82-1.98-.22-.52-.44-.44-.6-.44h-.52c-.18 0-.48.06-.72.34-.24.28-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.14.18 1.88 2.88 4.56 4.04.64.28 1.14.44 1.52.56.64.2 1.22.18 1.68.1.52-.08 1.64-.66 1.88-1.3.24-.64.24-1.18.18-1.3-.06-.12-.24-.2-.52-.34z"/>
                                        </svg>

                                        <span>WhatsApp</span>
                                    </a>
                                    <a href="tel:+${pastor.phone}" class="btn-action btn-call-secondary" title="Call">
                                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 9C3 5.58172 5.58172 3 9 3H11.3934C11.7733 3 12.1152 3.27543 12.2288 3.70166L13.7257 9.0151C13.8831 9.54543 13.7694 10.0288 13.3243 10.2693L11.2335 11.3434C11.6464 12.6788 12.4577 14.0602 13.7711 15.3736C15.0845 16.687 16.4659 17.4983 17.8013 17.9112L19.1946 16.0337C19.4352 15.5886 19.9497 15.4749 20.3989 15.6323L25.7123 18.1301C26.1385 18.2862 26.4139 18.6483 26.4139 19.0788V21C26.4139 23.1046 25.5185 24 23.4139 24H21C10.5066 24 2 15.4934 2 5V3Z"/></svg>
                                        <span>Call</span>
                                    </a>
                                </div>
                            </div>
                        ` : '<p class="no-pastor">No pastor assigned to this group</p>'}
                    </div>
                    
                    <!-- Fellow Group Members Section -->
                    ${groupMembers.length > 0 ? `
                        <div class="group-members-section">
                            <h3 class="section-title">Fellow Group Members (${groupMembers.length})</h3>
                            <div class="members-list">
                                ${groupMembers.map(m => `
                                    <div class="member-row">
                                        <div class="member-row-info">
                                            <p class="member-row-name">${escapeHtml(m.name)}</p>
                                            <p class="member-row-year">Year ${m.year}</p>
                                        </div>
                                        <div class="member-row-actions">
                                            <a href="https://wa.me/${cleanPhone(m.phone)}" target="_blank" class="btn-icon btn-icon-whatsapp" title="WhatsApp">
                                                  <svg class="wa-icon wa-icon-small" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                            d="M16 3C9.37 3 4 8.37 4 15c0 2.38.7 4.6 1.9 6.48L4 29l7.72-1.86A12.9 12.9 0 0 0 16 27c6.63 0 12-5.37 12-12S22.63 3 16 3zm0 22c-2.04 0-3.95-.6-5.55-1.62l-.4-.24-4.6 1.1 1.12-4.48-.26-.43A9.96 9.96 0 0 1 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.02-7.56c-.28-.14-1.64-.8-1.9-.9-.25-.1-.43-.14-.6.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.06-.28-.14-1.18-.44-2.24-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.42.12-.56.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.06-.34-.02-.48-.08-.14-.6-1.44-.82-1.98-.22-.52-.44-.44-.6-.44h-.52c-.18 0-.48.06-.72.34-.24.28-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.14.18 1.88 2.88 4.56 4.04.64.28 1.14.44 1.52.56.64.2 1.22.18 1.68.1.52-.08 1.64-.66 1.88-1.3.24-.64.24-1.18.18-1.3-.06-.12-.24-.2-.52-.34z"/>
                                                    </svg>
    
                                            </a>
                                            <a href="tel:+${cleanPhone(m.phone)}" class="btn-icon" title="Call">
                                            <svg class="call-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="currentColor"
                                                    d="M6.6 10.8c1.6 3.1 4.1 5.6 7.2 7.2l2.4-2.4c.3-.3.8-.4 1.2-.3 1.3.4 2.7.6 4.1.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.6 22.2 1.8 13.4 1.8 2.6 1.8 1.9 2.3 1.4 3 1.4H7c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2L6.6 10.8z"/>
                                            </svg>
   
                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Subcom Leaders Section -->
                    <div class="subcom-section">
                        <button class="btn-subcom-toggle" onclick="toggleSubcomLeaders(this)">
                            <span>Subcom Leaders (${subcomLeaders.length})</span>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6H15M9 12H15M9 18H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                        </button>
                             
                            <div class="subcom-leaders-list" style="display: none;">
                                 ${subcomLeaders.map(s => `
                                    <div class="subcom-leader">
                                        <p class="subcom-name">${escapeHtml(s.name)}</p>
                                        <div class="subcom-actions">
                                            <a href="https://wa.me/${pastor.phone}" target="_blank" class="btn-icon btn-icon-small btn-icon-whatsapp" title="WhatsApp">
                                                  <svg class="wa-icon wa-icon-small" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill="currentColor"
                                                                d="M16 3C9.37 3 4 8.37 4 15c0 2.38.7 4.6 1.9 6.48L4 29l7.72-1.86A12.9 12.9 0 0 0 16 27c6.63 0 12-5.37 12-12S22.63 3 16 3zm0 22c-2.04 0-3.95-.6-5.55-1.62l-.4-.24-4.6 1.1 1.12-4.48-.26-.43A9.96 9.96 0 0 1 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.02-7.56c-.28-.14-1.64-.8-1.9-.9-.25-.1-.43-.14-.6.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.06-.28-.14-1.18-.44-2.24-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.42.12-.56.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.06-.34-.02-.48-.08-.14-.6-1.44-.82-1.98-.22-.52-.44-.44-.6-.44h-.52c-.18 0-.48.06-.72.34-.24.28-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.14.18 1.88 2.88 4.56 4.04.64.28 1.14.44 1.52.56.64.2 1.22.18 1.68.1.52-.08 1.64-.66 1.88-1.3.24-.64.24-1.18.18-1.3-.06-.12-.24-.2-.52-.34z"/>
                                                    </svg>

                                            </a>
                                            <a href="tel:+${pastor.phone}" class="btn-icon btn-icon-small btn-icon-call" title="Call">
                                            <svg class="call-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="currentColor"
                                                        d="M6.6 10.8c1.6 3.1 4.1 5.6 7.2 7.2l2.4-2.4c.3-.3.8-.4 1.2-.3 1.3.4 2.7.6 4.1.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.6 22.2 1.8 13.4 1.8 2.6 1.8 1.9 2.3 1.4 3 1.4H7c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2L6.6 10.8z"/>
                                            </svg>
    
                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        elements.resultsContainer.innerHTML = html;
    }

    function renderPastorSearchResults(pastors) {
        if (pastors.length === 0) {
            elements.resultsContainer.innerHTML = '';
            showEmptyState();
            return;
        }
        
        hideEmptyState();
        let html = '<div class="results-container">';
        
        for (const pastor of pastors) {
            const groupMembers = findMembersByGroup(pastor.group);
            const subcomLeaders = appState.subcomLeaders;

            
            html += `
                <div class="result-card pastor-card">
                    <!-- Pastor Badge -->
                    <div class="member-badge-section">
                        <span class="member-badge pastor-badge">${escapeHtml(pastor.name)}</span>
                    </div>
                    
                    <!-- Group Members Section -->
                    ${groupMembers.length > 0 ? `
                        <div class="group-members-section">
                            <h3 class="section-title">Group Members (${groupMembers.length})</h3>
                            <div class="members-list">
                                ${groupMembers.map(m => `
                                    <div class="member-row">
                                        <div class="member-row-info">
                                            <p class="member-row-name">${escapeHtml(m.name)}</p>
                                            <p class="member-row-year">Year ${m.year}</p>
                                        </div>
                                        <div class="member-row-actions">
                                            <a href="https://wa.me/${pastor.phone}" target="_blank" class="btn-icon btn-icon-whatsapp" title="WhatsApp">
                                         <svg class="wa-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="currentColor"
                                                    d="M16 3C9.37 3 4 8.37 4 15c0 2.38.7 4.6 1.9 6.48L4 29l7.72-1.86A12.9 12.9 0 0 0 16 27c6.63 0 12-5.37 12-12S22.63 3 16 3zm0 22c-2.04 0-3.95-.6-5.55-1.62l-.4-.24-4.6 1.1 1.12-4.48-.26-.43A9.96 9.96 0 0 1 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.02-7.56c-.28-.14-1.64-.8-1.9-.9-.25-.1-.43-.14-.6.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.06-.28-.14-1.18-.44-2.24-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.42.12-.56.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.06-.34-.02-.48-.08-.14-.6-1.44-.82-1.98-.22-.52-.44-.44-.6-.44h-.52c-.18 0-.48.06-.72.34-.24.28-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.14.18 1.88 2.88 4.56 4.04.64.28 1.14.44 1.52.56.64.2 1.22.18 1.68.1.52-.08 1.64-.66 1.88-1.3.24-.64.24-1.18.18-1.3-.06-.12-.24-.2-.52-.34z"/>
                                        </svg>

                                            </a>
                                            <a href="tel:+${pastor.phone}" class="btn-icon btn-icon-call" title="Call">
                                                    <svg class="call-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                            d="M6.6 10.8c1.6 3.1 4.1 5.6 7.2 7.2l2.4-2.4c.3-.3.8-.4 1.2-.3 1.3.4 2.7.6 4.1.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.6 22.2 1.8 13.4 1.8 2.6 1.8 1.9 2.3 1.4 3 1.4H7c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2L6.6 10.8z"/>
                                                    </svg>

                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '<p class="no-members">No members in this group</p>'}
                    
                    <!-- Subcom Leaders Section -->
                    <div class="subcom-section">
                        <button class="btn-subcom-toggle" onclick="toggleSubcomLeaders(this)">
                            <span>Subcom Leaders (${subcomLeaders.length})</span>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6H15M9 12H15M9 18H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                        </button>
                       
                            <div class="subcom-leaders-list" style="display: none;">
                                  ${subcomLeaders.map(s => `
                                    <div class="subcom-leader">
                                        <p class="subcom-name">${escapeHtml(s.name)}</p>
                                        <div class="subcom-actions">
                                            <a href="https://wa.me/${pastor.phone}" target="_blank" class="btn-icon btn-icon-small btn-icon-whatsapp" title="WhatsApp">
                                               <svg class="wa-icon wa-icon-small" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                            d="M16 3C9.37 3 4 8.37 4 15c0 2.38.7 4.6 1.9 6.48L4 29l7.72-1.86A12.9 12.9 0 0 0 16 27c6.63 0 12-5.37 12-12S22.63 3 16 3zm0 22c-2.04 0-3.95-.6-5.55-1.62l-.4-.24-4.6 1.1 1.12-4.48-.26-.43A9.96 9.96 0 0 1 6 15c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.02-7.56c-.28-.14-1.64-.8-1.9-.9-.25-.1-.43-.14-.6.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.06-.28-.14-1.18-.44-2.24-1.4-.83-.74-1.4-1.66-1.56-1.94-.16-.28-.02-.42.12-.56.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.06-.34-.02-.48-.08-.14-.6-1.44-.82-1.98-.22-.52-.44-.44-.6-.44h-.52c-.18 0-.48.06-.72.34-.24.28-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.14.18 1.88 2.88 4.56 4.04.64.28 1.14.44 1.52.56.64.2 1.22.18 1.68.1.52-.08 1.64-.66 1.88-1.3.24-.64.24-1.18.18-1.3-.06-.12-.24-.2-.52-.34z"/>
                                                </svg>

                                            </a>
                                            <a href="tel:+${pastor.phone}" class="btn-icon btn-icon-small btn-icon-call" title="Call">
                                                  <svg class="call-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                            d="M6.6 10.8c1.6 3.1 4.1 5.6 7.2 7.2l2.4-2.4c.3-.3.8-.4 1.2-.3 1.3.4 2.7.6 4.1.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.6 22.2 1.8 13.4 1.8 2.6 1.8 1.9 2.3 1.4 3 1.4H7c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2L6.6 10.8z"/>
                                                    </svg>
 
                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        elements.resultsContainer.innerHTML = html;
    }

    function renderResults() {
        const query = appState.searchQuery;
        
        if (!query) {
            elements.resultsContainer.innerHTML = '';
            showEmptyState();
            return;
        }
        
        if (appState.currentRole === 'member') {
            const results = searchMembers(query);
            renderMemberSearchResults(results);
        } else {
            const results = searchPastors(query);
            renderPastorSearchResults(results);
        }
    }

    // ======================================
    // UI STATE FUNCTIONS
    // ======================================

    function showLoadingState() {
        elements.loadingState.style.display = 'flex';
        elements.errorState.style.display = 'none';
        elements.contentArea.style.display = 'none';
    }

    function hideLoadingState() {
        elements.loadingState.style.display = 'none';
        elements.contentArea.style.display = 'block';
    }

    function showErrorState(message = 'An error occurred while loading data.') {
        elements.errorMessage.textContent = message;
        elements.errorState.style.display = 'flex';
        elements.loadingState.style.display = 'none';
        elements.contentArea.style.display = 'none';
    }

    function showEmptyState() {
        elements.emptyState.style.display = 'flex';
        elements.resultsContainer.innerHTML = '';
    }

    function hideEmptyState() {
        elements.emptyState.style.display = 'none';
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ======================================
    // EVENT HANDLERS
    // ======================================

    function togglePhoneVisibility(memberName, phone) {
        const key = memberName;
        appState.showPhones[key] = !appState.showPhones[key];
        renderResults();
    }

    function toggleSubcomLeaders(button) {
        const list = button.nextElementSibling;
        const isOpen = list.style.display !== 'none';
        list.style.display = isOpen ? 'none' : 'block';
        button.classList.toggle('open', !isOpen);
    }

    // Role selector
    elements.roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.roleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.currentRole = btn.dataset.role;
            elements.searchInput.value = '';
            appState.searchQuery = '';
            elements.clearBtn.style.display = 'none';
            renderResults();
            
            // Auto-scroll to search bar
            scrollToSearch();
        });
    });

    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value;
        elements.clearBtn.style.display = appState.searchQuery ? 'inline-flex' : 'none';
        generateSuggestions(e.target.value);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            hideSuggestions();
        }
    });

    // Clear button
    elements.clearBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        appState.searchQuery = '';
        elements.clearBtn.style.display = 'none';
        renderResults();
    });

    // ======================================
    // INITIALIZATION
    // ======================================

    document.addEventListener('DOMContentLoaded', () => {
        fetchAllData();
    });
