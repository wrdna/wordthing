document.getElementById('searchButton').addEventListener('click', function() {
  const word = document.getElementById('wordInput').value.trim();
  if (word) {
    fetchWordData(word);
  } else {
    alert('Please enter a word');
  }
});

// Allow pressing Enter key to search
document.getElementById('wordInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('searchButton').click();
  }
});

async function fetchWordData(word) {
  try {
    // Fetch data from Dictionary API
    const dictionaryResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const dictionaryData = dictionaryResponse.ok ? await dictionaryResponse.json() : null;

    // Fetch data from Thesaurus API
    const thesaurusResponse = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
    const thesaurusData = await thesaurusResponse.json();

    if (!dictionaryData && (!thesaurusData || thesaurusData.length === 0)) {
      throw new Error('Word not found. Please try another word.');
    }

    // Display results
    displayResults(word, dictionaryData, thesaurusData);

    // Fetch AI description
    fetchAIDescription(word);

    // Fetch AI image
    fetchAIImage(word);

    // Fetch Latin roots and breakdown
    fetchLatinRoots(word);

  } catch (error) {
    console.error(error);
    displayError(error.message);
  }
}

function displayError(message) {
  const wordDetails = document.getElementById('wordDetails');
  wordDetails.classList.remove('hidden');
  wordDetails.innerHTML = `<p class="error-message">${message}</p>`;
}

function displayResults(word, dictionaryData, thesaurusData) {
  const wordDetails = document.getElementById('wordDetails');
  wordDetails.classList.remove('hidden');

  // Display the word
  const wordTitle = document.getElementById('wordTitle');
  wordTitle.textContent = word;

  // Display parts of speech
  const posContainer = document.getElementById('partOfSpeechContainer');
  posContainer.innerHTML = '';

  if (dictionaryData && dictionaryData[0] && dictionaryData[0].meanings) {
    const meanings = dictionaryData[0].meanings;
    meanings.forEach((meaning, index) => {
      const posButton = document.createElement('button');
      posButton.textContent = meaning.partOfSpeech;
      posButton.classList.add('pos-button');
      if (index === 0) posButton.classList.add('active');
      posButton.addEventListener('click', () => {
        document.querySelectorAll('.pos-button').forEach(btn => btn.classList.remove('active'));
        posButton.classList.add('active');
        displayDefinitions(meaning);
      });
      posContainer.appendChild(posButton);
    });

    // Display definitions for the first part of speech
    displayDefinitions(meanings[0]);
  } else {
    posContainer.innerHTML = '<p>No definitions found.</p>';
    document.getElementById('definitionContainer').innerHTML = '';
  }

  // Display thesaurus data
  displayThesaurus(thesaurusData);
}

function displayDefinitions(meaning) {
  const definitionContainer = document.getElementById('definitionContainer');
  definitionContainer.innerHTML = '';

  const definitionList = document.createElement('ol');
  definitionList.classList.add('definition-list');

  meaning.definitions.forEach(def => {
    const listItem = document.createElement('li');

    const defText = document.createElement('p');
    defText.textContent = def.definition;
    listItem.appendChild(defText);

    if (def.example) {
      const exampleText = document.createElement('p');
      exampleText.innerHTML = `<em>Example: ${def.example}</em>`;
      listItem.appendChild(exampleText);
    }

    if (def.synonyms && def.synonyms.length > 0) {
      const synonymsText = document.createElement('p');
      synonymsText.innerHTML = `<strong>Synonyms:</strong> ${def.synonyms.join(', ')}`;
      listItem.appendChild(synonymsText);
    }

    definitionList.appendChild(listItem);
  });

  definitionContainer.appendChild(definitionList);
}

function displayThesaurus(data) {
  const thesaurusContainer = document.getElementById('thesaurusContainer');
  thesaurusContainer.innerHTML = '';

  if (data.length > 0) {
    data.slice(0, 20).forEach(item => {
      const synonymBtn = document.createElement('div');
      synonymBtn.textContent = item.word;
      synonymBtn.classList.add('synonym');
      synonymBtn.addEventListener('click', () => {
        document.getElementById('wordInput').value = item.word;
        fetchWordData(item.word);
      });
      thesaurusContainer.appendChild(synonymBtn);
    });
  } else {
    thesaurusContainer.innerHTML = '<p>No synonyms found.</p>';
  }
}

function fetchAIDescription(word) {
  fetch('/berg/api/description', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ word })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    }
    const aiDescriptionContainer = document.getElementById('aiDescriptionContainer');
    aiDescriptionContainer.innerHTML = `<p>${data.description}</p>`;
  })
  .catch(error => {
    console.error('Error fetching AI description:', error);
    const aiDescriptionContainer = document.getElementById('aiDescriptionContainer');
    aiDescriptionContainer.innerHTML = '<p>Error fetching AI description.</p>';
  });
}

function fetchAIImage(word) {
  fetch('/berg/api/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ word })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    }
    const aiImageContainer = document.getElementById('aiImageContainer');
    aiImageContainer.innerHTML = `<img src="${data.imageUrl}" alt="AI-generated image of ${word}">`;
  })
  .catch(error => {
    console.error('Error fetching AI image:', error);
    const aiImageContainer = document.getElementById('aiImageContainer');
    aiImageContainer.innerHTML = '<p>Error fetching AI image.</p>';
  });
}

function fetchLatinRoots(word) {
  fetch('/berg/api/latin-roots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ word })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    }
    const etymologyContainer = document.getElementById('etymologyContainer');
    etymologyContainer.innerHTML = `<p>${data.roots}</p>`;
  })
  .catch(error => {
    console.error('Error fetching Latin roots:', error);
    const etymologyContainer = document.getElementById('etymologyContainer');
    etymologyContainer.innerHTML = '<p>Error fetching Latin roots.</p>';
  });
}

