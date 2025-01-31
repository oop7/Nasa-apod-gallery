document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'GW79mC0zansrxxmlzORH5et1G4D7R6kbhgOOsrQw'; // Your NASA API key
    const apodContainer = document.getElementById('apod-container');
    const fetchButton = document.getElementById('fetch-pictures');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalClose = document.getElementById('modal-close');
    const batchSize = 5; // Number of requests to handle concurrently
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const clearButton = document.getElementById('clear-results');
  
    // New features
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentPage = 1;
    let isLoading = false;
    
    // Initialize date inputs with current date and last month
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('end-date').value = today.toISOString().split('T')[0];
    document.getElementById('start-date').value = lastMonth.toISOString().split('T')[0];

    // Infinite scroll
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (!isLoading) {
                loadMoreImages();
            }
        }
    });

    function loadMoreImages() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        if (startDate && endDate) {
            currentPage++;
            fetchPicturesInChunks(startDate, endDate);
        }
    }

    // Enhanced image card creation
    function createImageCard(item) {
        const apodItem = document.createElement('div');
        apodItem.className = 'apod-item';
        
        const isFavorite = favorites.includes(item.url);
        
        apodItem.innerHTML = `
            <div class="image-container">
                <img src="${item.url}" alt="${item.title}" loading="lazy">
                <div class="image-overlay">
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" title="Add to favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="action-btn share-btn" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="action-btn download-btn" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
            <div class="content">
                <h2>${item.title}</h2>
                <p class="date">${new Date(item.date).toLocaleDateString()}</p>
                <p class="description">${item.explanation}</p>
                <div class="tags">
                    ${generateTags(item.title)}
                </div>
            </div>
        `;

        // Event listeners for buttons
        const favoriteBtn = apodItem.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => toggleFavorite(item.url, favoriteBtn));

        const shareBtn = apodItem.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => shareImage(item));

        const downloadBtn = apodItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => downloadImage(item.url, item.title));

        // Double click for modal
        apodItem.addEventListener('dblclick', () => showModal(item));

        return apodItem;
    }

    // Utility functions
    function generateTags(title) {
        const keywords = title.toLowerCase().split(' ')
            .filter(word => word.length > 3)
            .slice(0, 3);
        return keywords.map(word => `<span class="tag">#${word}</span>`).join('');
    }

    function toggleFavorite(url, btn) {
        if (favorites.includes(url)) {
            favorites = favorites.filter(item => item !== url);
            btn.classList.remove('active');
            showToast('Removed from favorites');
        } else {
            favorites.push(url);
            btn.classList.add('active');
            showToast('Added to favorites');
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    async function shareImage(item) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: item.explanation,
                    url: item.url
                });
                showToast('Shared successfully');
            } catch (err) {
                showToast('Error sharing');
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(item.url);
            showToast('Link copied to clipboard');
        }
    }

    async function downloadImage(url, title) {
        try {
            showToast('Starting download...');
            
            // Use NASA's API to get the HD version if available
            const hdUrl = url.replace('_960', '');
            
            // Create a proxy URL using a CORS proxy service
            const proxyUrl = `https://images-api.nasa.gov/asset/${title}`;
            
            // Create a temporary link
            const link = document.createElement('a');
            link.href = url; // Use direct URL as fallback
            link.target = '_blank';
            link.download = `${title.replace(/\s+/g, '_')}.jpg`;
            
            // If direct download fails, open in new tab
            link.click();
            
            showToast('If download didn\'t start, image opened in new tab');
        } catch (err) {
            console.error('Download error:', err);
            showToast('Opening image in new tab instead');
            window.open(url, '_blank');
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
            // Add arrow key navigation here if needed
        }
    });

    clearButton.addEventListener('click', () => {
        apodContainer.innerHTML = '';
        errorMessage.style.display = 'none';
    });
  
    fetchButton.addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        errorMessage.style.display = 'none';
        
        if (startDate && endDate) {
            if (new Date(startDate) <= new Date(endDate)) {
                loading.style.display = 'block';
                fetchPicturesInChunks(startDate, endDate);
            } else {
                showError('Start date must be earlier than or equal to end date.');
            }
        } else {
            showError('Please select both start and end dates.');
        }
    });
  
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
  
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
          loading.style.display = 'none';
          console.log('Fetched data:', data);
          if (!Array.isArray(data)) {
            data = [data];
          }
          data.forEach(item => {
            const apodItem = createImageCard(item);
            apodContainer.appendChild(apodItem);
          });
        })
        .catch(error => {
          loading.style.display = 'none';
          showError('Error fetching data. Please try again later.');
          console.error('Error fetching data from NASA API:', error);
        });
    }
  
    function showModal(item) {
      modal.style.display = 'flex';
      modalImg.src = item.url;
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
  