document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'GW79mC0zansrxxmlzORH5et1G4D7R6kbhgOOsrQw'; // Your NASA API key
    const apodContainer = document.getElementById('apod-container');
    const fetchButton = document.getElementById('fetch-pictures');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalClose = document.getElementById('modal-close');
    const batchSize = 5; // Number of requests to handle concurrently
  
    fetchButton.addEventListener('click', () => {
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;
      if (startDate && endDate) {
        if (new Date(startDate) <= new Date(endDate)) {
          fetchPicturesInChunks(startDate, endDate);
        } else {
          console.error('Start date must be earlier than or equal to end date.');
        }
      } else {
        console.error('Please select both start and end dates.');
      }
    });
  
    function fetchPicturesInChunks(startDate, endDate) {
      const dateChunks = getDateChunks(startDate, endDate, batchSize);
      apodContainer.innerHTML = ''; // Clear existing content
  
      function fetchNextBatch(index) {
        if (index >= dateChunks.length) return; // Stop if all chunks are processed
        const dateRange = dateChunks[index];
        fetchPictures(dateRange.start, dateRange.end).finally(() => {
          setTimeout(() => fetchNextBatch(index + 1), 500); // Add a delay between batches
        });
      }
  
      fetchNextBatch(0); // Start fetching from the first chunk
    }
  
    function getDateChunks(startDate, endDate, chunkSize) {
      const dateChunks = [];
      let currentStartDate = new Date(startDate);
  
      while (currentStartDate <= new Date(endDate)) {
        let currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() + chunkSize - 1);
        if (currentEndDate > new Date(endDate)) {
          currentEndDate = new Date(endDate);
        }
        dateChunks.push({
          start: currentStartDate.toISOString().split('T')[0],
          end: currentEndDate.toISOString().split('T')[0]
        });
        currentStartDate.setDate(currentStartDate.getDate() + chunkSize);
      }
  
      return dateChunks;
    }
  
    function fetchPictures(startDate, endDate) {
      const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
      console.log('Fetching pictures from:', apiUrl);
  
      return fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched data:', data);
          if (!Array.isArray(data)) {
            data = [data];
          }
          data.forEach(item => {
            const apodItem = document.createElement('div');
            apodItem.className = 'apod-item';
            apodItem.innerHTML = `
              <img src="${item.url}" alt="${item.title}" loading="lazy">
              <h2>${item.title}</h2>
              <p class="description">${item.explanation}</p>
            `;
            apodItem.addEventListener('dblclick', () => {
              showModal(item.url);
            });
            apodContainer.appendChild(apodItem);
          });
        })
        .catch(error => console.error('Error fetching data from NASA API:', error));
    }
  
    function showModal(imageUrl) {
      modal.style.display = 'flex';
      modalImg.src = imageUrl;
    }
  
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
  