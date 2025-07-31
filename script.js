document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for PWA functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Get the correct path for GitHub Pages
            const swPath = window.location.pathname.endsWith('/') ? 
                window.location.pathname + 'sw.js' : 
                window.location.pathname + '/sw.js';
            
            navigator.serviceWorker.register(swPath)
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                    // Don't let SW failure break the app
                });
        });
    }

    // API Key configuration for GitHub deployment with fallback
    const apiKey = window.NASA_API_KEY || 'DEMO_KEY'; // Will use GitHub Pages injected variable or demo key
    
    // Debug: Log API key status (without exposing the actual key)
    if (apiKey === 'DEMO_KEY') {
        console.log('🔑 Using DEMO_KEY - Rate limited to 30 requests/hour');
        console.log('💡 Get your free API key at https://api.nasa.gov/ for unlimited access');
        console.log('ℹ️ Or add your API key as NASA_API_KEY in GitHub repository secrets');
        // Show the API notice for demo users
        document.querySelector('.api-notice').style.display = 'block';
    } else {
        console.log('🔑 Using custom NASA API key - Unlimited access ✅');
        // Hide the API notice for users with their own key
        document.querySelector('.api-notice').style.display = 'none';
    }
    const apodContainer = document.getElementById('apod-container');
    const fetchButton = document.getElementById('fetch-pictures');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalClose = document.getElementById('modal-close');
    const batchSize = 3; // Number of days per request - reduced to avoid rate limits
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const clearButton = document.getElementById('clear-results');
    const showFavoritesButton = document.getElementById('show-favorites');
    const searchInput = document.getElementById('search-input');
  
    // New features
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentPage = 1;
    let isLoading = false;
    let allImages = []; // Store all fetched images for search
    let isShowingFavorites = false;
    
    // Initialize date inputs with current date and last month
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('end-date').value = today.toISOString().split('T')[0];
    document.getElementById('start-date').value = lastMonth.toISOString().split('T')[0];

    // Search functionality
    searchInput.addEventListener('input', debounce(filterImages, 300));

    // Show favorites functionality
    showFavoritesButton.addEventListener('click', () => {
        if (isShowingFavorites) {
            displayAllImages();
            showFavoritesButton.textContent = 'Show Favorites';
            isShowingFavorites = false;
        } else {
            displayFavorites();
            showFavoritesButton.textContent = 'Show All';
            isShowingFavorites = true;
        }
    });

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function filterImages() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            displayAllImages();
            return;
        }

        const filteredImages = allImages.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.explanation.toLowerCase().includes(searchTerm)
        );

        displayImages(filteredImages);
    }

    function displayImages(images) {
        apodContainer.innerHTML = '';
        images.forEach(item => {
            const apodItem = createImageCard(item);
            apodContainer.appendChild(apodItem);
        });
    }

    function displayAllImages() {
        displayImages(allImages);
    }

    function displayFavorites() {
        const favoriteImages = allImages.filter(item => favorites.includes(item.url));
        if (favoriteImages.length === 0) {
            apodContainer.innerHTML = '<div class="no-favorites">No favorite images yet. Click the heart icon on images to add them to favorites!</div>';
        } else {
            displayImages(favoriteImages);
        }
    }

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
        // Skip non-image media types
        if (item.media_type !== 'image') {
            return createVideoCard(item);
        }

        const apodItem = document.createElement('div');
        apodItem.className = 'apod-item';
        
        const isFavorite = favorites.includes(item.url);
        
        apodItem.innerHTML = `
            <div class="image-container">
                <img src="${item.url}" alt="${item.title}" loading="lazy" onerror="handleImageError(this)" tabindex="0" role="img" aria-label="${item.title}">
                <div class="image-overlay">
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" title="Add to favorites" aria-label="Add ${item.title} to favorites">
                        <i class="fas fa-heart" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn share-btn" title="Share" aria-label="Share ${item.title}">
                        <i class="fas fa-share-alt" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn download-btn" title="Download" aria-label="Download ${item.title}">
                        <i class="fas fa-download" aria-hidden="true"></i>
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

        // Keyboard navigation for image
        const img = apodItem.querySelector('img');
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showModal(item);
            }
        });

        return apodItem;
    }

    // Handle video content
    function createVideoCard(item) {
        const apodItem = document.createElement('div');
        apodItem.className = 'apod-item video-item';
        
        apodItem.innerHTML = `
            <div class="video-container">
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <p>Video Content</p>
                </div>
                <div class="image-overlay">
                    <button class="action-btn view-btn" title="View Video">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="action-btn share-btn" title="Share">
                        <i class="fas fa-share-alt"></i>
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

        const viewBtn = apodItem.querySelector('.view-btn');
        viewBtn.addEventListener('click', () => window.open(item.url, '_blank'));

        const shareBtn = apodItem.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => shareImage(item));

        return apodItem;
    }

    // Handle image loading errors
    window.handleImageError = function(img) {
        img.style.display = 'none';
        const container = img.parentElement;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Image failed to load</p>
            <button onclick="retryImageLoad(this)" class="retry-btn">Retry</button>
        `;
        container.appendChild(errorDiv);
    };

    // Retry loading failed images
    window.retryImageLoad = function(btn) {
        const container = btn.closest('.image-container');
        const img = container.querySelector('img');
        const errorDiv = container.querySelector('.image-error');
        
        errorDiv.remove();
        img.style.display = 'block';
        
        // Force reload by changing src
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => {
            img.src = originalSrc + '?retry=' + Date.now();
        }, 100);
    };

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

    // Performance optimization: Lazy loading setup
    function setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (!img.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
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
      
      // Reset the images array when fetching new data
      allImages = [];
      
      // Update loading message to show progress
      loading.innerHTML = `Loading images... (0/${dateChunks.length} batches complete)<br><small>⏳ NASA API has rate limits - please wait between requests</small>`;
      loading.style.display = 'block';
  
      function fetchNextBatch(index) {
        if (index >= dateChunks.length) {
          isLoading = false;
          loading.style.display = 'none';
          return;
        }
        
        isLoading = true;
        const dateRange = dateChunks[index];
        
        // Update progress
        loading.innerHTML = `Loading images... (${index}/${dateChunks.length} batches complete)<br><small>⏳ Fetching ${dateRange.start} to ${dateRange.end}...</small>`;
        
        fetchPictures(dateRange.start, dateRange.end).finally(() => {
          // Increase delay to respect NASA's rate limits (3-5 seconds recommended)
          setTimeout(() => fetchNextBatch(index + 1), 4000); // Increased to 4 seconds
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
  
    function fetchPictures(startDate, endDate, retryCount = 0) {
      const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
      console.log('Fetching pictures from:', apiUrl);
  
      return fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            if (response.status === 429) {
              // Rate limited - throw error with retry suggestion
              throw new Error(`Rate limit exceeded for dates ${startDate} to ${endDate}. NASA API allows 1000 requests/hour with burst protection. Try smaller date ranges or wait longer between requests.`);
            } else if (response.status === 403) {
              throw new Error('Invalid API key. Please check your NASA API key.');
            } else {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched data:', data);
          if (!Array.isArray(data)) {
            data = [data];
          }
          data.forEach(item => {
            // Store all images for search functionality
            if (!allImages.find(img => img.url === item.url)) {
              allImages.push(item);
            }
            const apodItem = createImageCard(item);
            apodContainer.appendChild(apodItem);
          });
          
          // Setup lazy loading observer
          setupLazyLoading();
        })
        .catch(error => {
          let errorMsg = 'Error fetching data. Please try again later.';
          
          if (error.message.includes('Rate limit')) {
            errorMsg = `⚠️ ${error.message} Try reducing your date range or waiting longer between requests.`;
          } else if (error.message.includes('Invalid API key')) {
            errorMsg = 'Invalid API key. Please check your NASA API key configuration.';
          }
          
          showError(errorMsg);
          console.error('Error fetching data from NASA API:', error);
        });
    }
  
    function showModal(item) {
      modal.style.display = 'flex';
      modalImg.src = item.url;
      modalImg.alt = item.title;
      
      // Add image metadata
      const existingInfo = modal.querySelector('.modal-info');
      if (existingInfo) existingInfo.remove();
      
      const modalInfo = document.createElement('div');
      modalInfo.className = 'modal-info';
      modalInfo.innerHTML = `
        <h3>${item.title}</h3>
        <p class="modal-date">${new Date(item.date).toLocaleDateString()}</p>
        <div class="modal-controls">
          <button class="modal-btn zoom-in" title="Zoom In" aria-label="Zoom in">
            <i class="fas fa-search-plus"></i>
          </button>
          <button class="modal-btn zoom-out" title="Zoom Out" aria-label="Zoom out">
            <i class="fas fa-search-minus"></i>
          </button>
          <button class="modal-btn reset-zoom" title="Reset Zoom" aria-label="Reset zoom">
            <i class="fas fa-expand-arrows-alt"></i>
          </button>
        </div>
      `;
      
      modal.appendChild(modalInfo);
      
      // Add zoom functionality
      let currentZoom = 1;
      const zoomIn = modalInfo.querySelector('.zoom-in');
      const zoomOut = modalInfo.querySelector('.zoom-out');
      const resetZoom = modalInfo.querySelector('.reset-zoom');
      
      zoomIn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom * 1.2, 3);
        modalImg.style.transform = `scale(${currentZoom})`;
      });
      
      zoomOut.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom / 1.2, 0.5);
        modalImg.style.transform = `scale(${currentZoom})`;
      });
      
      resetZoom.addEventListener('click', () => {
        currentZoom = 1;
        modalImg.style.transform = 'scale(1)';
      });
      
      // Reset zoom when modal closes
      const resetOnClose = () => {
        currentZoom = 1;
        modalImg.style.transform = 'scale(1)';
      };
      
      modalClose.addEventListener('click', resetOnClose);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) resetOnClose();
      });
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
  
