function getCookie(name) {
    const cookies = document.cookie?.split(';') || [];
    for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

const csrfToken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () => {
    const modalHeader = document.querySelector('.modal-header');
    const cardTitleElements = document.querySelectorAll('#topicNameDisplay');
    const cardBody = document.querySelector('.modal-body');
    const addTopicButton = document.querySelector('#addTopic');
    const topicInput = document.querySelector('#noteTitle');
    const detailsInput = document.querySelector('#noteContent');
    const saveButton = document.querySelector('#saveNote');

    const topicNameDisplay = document.querySelector('#topicNameDisplay');
    const topicNameInput = document.querySelector('#topicNameInput');
    const editTopicBtn = document.querySelector('#editTopicBtn');

    let currentSubtopicId = 0;
    let deleteSubtopicId = 0;

    const disableButtonIfEmpty = (input, button) => {
        input.addEventListener('input', () => button.disabled = !input.value.trim());
    };

    const updateModalTitle = (title) => cardTitleElements.forEach(titleElement => titleElement.textContent = title);

    const checkTopicExistence = () => { 
        const topicName = topicNameDisplay.textContent.trim(); 
        if (topicName !== "No notes available.") { 
            editTopicBtn.style.display = 'inline-block'; 
        } else { 
            editTopicBtn.style.display = 'none'; 
        } 
    };

    const loadNoteForm = ({ room_id, item_name }) => {
        cardBody.innerHTML = `
            <div class="mb-3">
                <label for="noteTitle" class="form-label">Topic</label>
                <div class="d-flex">
                    <input type="text" class="form-control me-2" id="topicInput" placeholder="Create new topic...">
                    <button type="button" id="create" class="btn btn-primary" disabled>Create</button>
                </div>
            </div>`;
        
        const topicInputElement = document.querySelector('#topicInput');
        const createButton = document.querySelector('#create');
        disableButtonIfEmpty(topicInputElement, createButton);
        addTopicButton.disabled = true;

        createButton.addEventListener('click', async () => {
            try {
                const { id, title } = await createTopic(room_id, item_name, topicInputElement.value);
                updateModalTitle(title);
                cardBody.innerHTML = "<p>No subtopics available.</p>";
                editTopicBtn.style.display = 'inline-block'; 
                addTopicButton.disabled = false;
                modalHeader.setAttribute('data-item', id);
            } catch (error) {
                console.error('Error creating topic:', error);
            }
        });
    };

    const loadTopics = (title, topics) => {
        updateModalTitle(title);
        cardBody.innerHTML = topics.length 
            ? topics.map(subtopic => createSubtopicElement(subtopic)).join('') 
            : "<p>No subtopics available.</p>";
        addTopicButton.disabled = false;
    };

    const createSubtopicElement = (subtopic) => `
        <div class="modal-card border rounded shadow-sm p-3 mb-3">
            <h5 class="modal-card-title d-flex justify-content-between align-items-center" data-subtopic="${subtopic.id}">
                <span class="fw-bold">${escapeHTML(subtopic.title)}</span>
                <div>
                    <button class="btn bg-primary-subtle edit-btn ms-3" title="Edit" data-bs-target="#staticBackdrop2" data-bs-toggle="modal">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger delete-btn ms-2" title="Delete" data-bs-target="#confirmDeleteModal" data-bs-toggle="modal">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </h5>
            ${subtopic.content ? `<pre class="modal-card-text mt-2">${escapeHTML(subtopic.content)}</pre>` : ''}
        </div>`;


    const handleAreaClick = async (target) => {
        const item_name = target.getAttribute('title');
        const room_id = target.getAttribute('data-room-id');
        updateModalTitle('No notes available.');
        cardBody.innerHTML = '';

        try {
            const response = await fetch(`/items/${room_id}/${item_name}`);
            const data = await response.json();
            if (data.error) {
                console.error('Error:', data.error);
                loadNoteForm({ room_id, item_name });
            } else {
                loadTopics(data.title, data.topics);
                modalHeader.setAttribute('data-item', data.id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTopic = () => {
        topicInput.value = '';
        detailsInput.value = '';
        modalHeader.setAttribute('data-action', 'add');
        saveButton.disabled = true;
        disableButtonIfEmpty(topicInput, saveButton);
        setTimeout(() => topicInput.focus(), 500);
    };

    const handleEditSubtopic = (target) => {
        const subtopicElement = target.closest('.modal-card');
        currentSubtopicId = Number(subtopicElement.querySelector('.modal-card-title').getAttribute('data-subtopic'));
        topicInput.value = subtopicElement.querySelector('.modal-card-title span').textContent;
        detailsInput.value = subtopicElement.querySelector('.modal-card-text')?.textContent || '';
        modalHeader.setAttribute('data-action', 'edit');
        saveButton.disabled = false;
        disableButtonIfEmpty(topicInput, saveButton);
        setTimeout(() => detailsInput.focus(), 500);
    };

    const handleDeleteSubtopic = (target) => {
        const subtopicElement = target.closest('.modal-card');
        deleteSubtopicId = Number(subtopicElement.querySelector('.modal-card-title').getAttribute('data-subtopic'));
    };

    document.addEventListener('click', async (event) => {
        const target = event.target;

        // Handle area click
        if (target.tagName.toLowerCase() === 'area') {
            await handleAreaClick(target);
            checkTopicExistence();
            return;
        }
        // Handle add topic button
        if (target.id === 'addTopic') {
            handleAddTopic();
            return;
        }
        // Handle edit subtopic button
        if (target.closest('.edit-btn')) {
            handleEditSubtopic(target);
            return;
        }
        // Handle delete subtopic button
        if (target.closest('.delete-btn')) {
            handleDeleteSubtopic(target);
            return;
        }
        // Handle editing topic name
        if (target.closest('#editTopicBtn')) {
            if (topicNameInput.style.display === 'none') {
                // Show input to edit
                topicNameDisplay.style.display = 'none';
                topicNameInput.style.display = 'inline-block';
                topicNameInput.placeholder = topicNameDisplay.textContent;
                topicNameInput.focus();
            } else {
                // Save or discard changes
                if (topicNameInput.value.trim() !== "") {
                    updateModalTitle(topicNameInput.value);
                    const item_id = Number(modalHeader.getAttribute('data-item'))
                    renameTopic(item_id, topicNameInput.value);
                    console.log("Save");
                }
                // Reset the input field and toggle visibility
                topicNameInput.style.display = 'none';
                topicNameInput.value = "";
                topicNameDisplay.style.display = 'inline-block';
            }
            return;
        }
        // Handle clicking outside of the topic name input (cancel editing)
        if (target !== topicNameInput && !target.closest('#editTopicBtn')) {
            topicNameInput.style.display = 'none';
            topicNameInput.value = "";
            topicNameDisplay.style.display = 'inline-block';
        }
    });
    

    saveButton.addEventListener('click', async () => {
        const action = modalHeader.getAttribute('data-action');
        const itemId = Number(modalHeader.getAttribute('data-item'));
        
        if (action === 'add') {
            const subtopic = await createSubtopic(itemId, topicInput.value, detailsInput.value);

            const noSubtopicsMessage = cardBody.querySelector('p');
            if (noSubtopicsMessage && noSubtopicsMessage.textContent === "No subtopics available.") {
                noSubtopicsMessage.remove();
            }
            
            cardBody.insertAdjacentHTML('beforeend', createSubtopicElement(subtopic));
        } else if (action === 'edit') {
            const updatedSubtopic = await editSubtopic(currentSubtopicId, topicInput.value, detailsInput.value);
            updateSubtopicInUI(updatedSubtopic);
            currentSubtopicId = 0;
        }
    });

    document.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
        if (deleteSubtopicId !== 0) {
            const data = await deleteSubtopic(deleteSubtopicId);
            if (data) {
                console.log(data.id)
                const subtopicElement = document.querySelector(`[data-subtopic="${data.id}"]`);
                if (subtopicElement) {
                    subtopicElement.closest('.modal-card').remove();
                }
                if (!cardBody.innerHTML.trim()) {
                    cardBody.innerHTML = "<p>No subtopics available.</p>";
                }                
            }
            deleteSubtopicId = 0;
        }
    });
});

// Utility functions for API calls
async function fetchJson(url, options) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}


async function createTopic(room_id, item_name, title) {
    return fetchJson(`/items/${room_id}/${item_name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ name: item_name, title })
    });
}

async function renameTopic(item_id, title) {
    return fetchJson(`/items/${item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ title })
    });
}

async function createSubtopic(item_id, title, content) {
    return fetchJson(`/subtopics/${item_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ title, content })
    });
}

async function editSubtopic(subtopic_id, title, content) {
    return fetchJson(`/subtopics/${subtopic_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ title, content })
    });
}

async function deleteSubtopic(subtopic_id) {
    return fetchJson(`/subtopics/${subtopic_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
    });
}

function updateSubtopicInUI({ id, title, content }) {
    const subtopicElement = document.querySelector(`[data-subtopic="${id}"]`);
    if (subtopicElement) {
        subtopicElement.querySelector('span').textContent = title;
        const contentElement = subtopicElement.closest('.modal-card').querySelector('.modal-card-text');
        if (contentElement) contentElement.textContent = content;
        else if (content) {
            const newContentElement = document.createElement('p');
            newContentElement.className = 'modal-card-text';
            newContentElement.textContent = content;
            subtopicElement.closest('.modal-card').append(newContentElement);
        }
    }
}

const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

window.addEventListener('load', resizeImageMap);
window.addEventListener('resize', resizeImageMap);

function resizeImageMap() {
    const image = document.querySelector('#room-image');
    const map = document.querySelector('map[name="room-map"]');
    const areas = map.getElementsByTagName('area');
    // Image's original width
    const originalWidth = 1000; 

    const scale = image.width / originalWidth;

    for (let area of areas) {
        const originalCoords = area.getAttribute('data-original-coords');
        
        if (!originalCoords) {
            area.setAttribute('data-original-coords', area.coords);
        }

        const coordsArray = area.getAttribute('data-original-coords').split(',').map(Number);
        const scaledCoords = coordsArray.map(coord => Math.round(coord * scale));
        area.coords = scaledCoords.join(',');
    }
}
