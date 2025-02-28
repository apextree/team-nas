
function initializeApp() {
    console.log("Notes app initialized");
    
    // Initialize form event listener
    const form = document.getElementById("note-form");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            saveNote();
        });
    }

    // Initialize search button
    const searchBtn = document.getElementById("search-button");
    if (searchBtn) {
        searchBtn.addEventListener("click", searchNotes);
    }

    // Attach delete handlers
    attachDeleteHandlers();
}

function attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll(".delete-note");
    deleteButtons.forEach(button => {
        button.onclick = function() {
            const noteId = this.getAttribute("data-note-id");
            deleteNote(noteId);
        };
    });
}

function deleteNote(noteId) {
    if (!noteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        fetch(`/apps/notes/delete/${noteId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const noteElement = document.querySelector(`[data-note-id="${noteId}"]`).closest('.note-card');
                if (noteElement) {
                    noteElement.remove();
                }
            } else {
                alert('Error deleting note: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Delete error:', error);
            alert('Error deleting note: ' + error.message);
        });
    }
}

function saveNote() {
    const titleInput = document.querySelector('input[name="title"]');
    const contentInput = document.querySelector('textarea[name="content"]');
    
    if (!titleInput || !contentInput) return;
    
    const formData = new FormData();
    formData.append('title', titleInput.value);
    formData.append('content', contentInput.value);
    
    fetch('/apps/notes/create', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            titleInput.value = '';
            contentInput.value = '';
            
            const notesList = document.getElementById('notes-list');
            
            // Remove the "No notes found" message if it exists
            const noNotesMessage = notesList.querySelector('.note-card p');
            if (noNotesMessage && noNotesMessage.textContent.includes('No notes found')) {
                noNotesMessage.closest('.note-card').remove();
            }
            
            const note = data.note;
            const noteHtml = `
                <div class="note-card">
                    <h3>${note.title}</h3>
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">
                        Created: ${note.created_at}
                        <button type="button" class="delete-note" data-note-id="${note.id}">Delete</button>
                    </div>
                </div>
            `;
            notesList.insertAdjacentHTML('afterbegin', noteHtml);
            attachDeleteHandlers();
        } else {
            alert('Error saving note: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Save error:', error);
        alert('Error saving note: ' + error.message);
    });
}

function searchNotes() {
    const query = document.getElementById('search').value;
    
    fetch(`/apps/notes/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;
        
        if (data.success && Array.isArray(data.notes)) {
            if (data.notes.length === 0) {
                notesList.innerHTML = '<div class="note-card"><p>No notes found matching your search.</p></div>';
                return;
            }
            
            notesList.innerHTML = data.notes.map(note => `
                <div class="note-card">
                    <h3>${note.title}</h3>
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">
                        Created: ${note.created_at}
                        <button type="button" class="delete-note" data-note-id="${note.id}">Delete</button>
                    </div>
                </div>
            `).join('');
            
            attachDeleteHandlers();
        }
    })
    .catch(error => {
        console.error('Search error:', error);
        const notesList = document.getElementById('notes-list');
        if (notesList) {
            notesList.innerHTML = '<div class="note-card"><p>An error occurred while searching notes.</p></div>';
        }
    });
}

function cleanupApp() {
    console.log('Cleaning up notes app');
    // Clear any event listeners if needed
}

// Export functions for modal system
window.initializeApp = initializeApp;
window.cleanupApp = cleanupApp;
