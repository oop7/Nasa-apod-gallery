# 🌌 NASA APOD Viewer

A modern web application that displays NASA's Astronomy Picture of the Day (APOD) images with an elegant interface and rich features. Browse through the cosmos with our intuitive gallery viewer!

![NASA APOD Viewer Demo](demo.gif)

## ✨ Features

### Core Features
- 🖼️ Fetch and display NASA's Astronomy Picture of the Day (APOD) images
- 📅 Select custom date ranges to view images from specific periods
- 🔍 View images in full screen with double-click
- 📱 Responsive and mobile-friendly design

### Enhanced Features
- ♾️ Infinite scroll for seamless browsing
- ❤️ Save favorite images locally
- 🔄 Share images on social media
- ⬇️ Download images directly
- 🏷️ Auto-generated image tags
- 🌓 Dark mode support
- 🔔 Toast notifications for user feedback
- 📊 Loading state indicators
- ⚡ Lazy loading for better performance

## 🛠️ Technologies Used

- HTML5
- CSS3 with Modern Features
  - Flexbox & Grid
  - CSS Variables
  - Animations & Transitions
- JavaScript (ES6+)
  - Async/Await
  - Local Storage
  - Intersection Observer
- NASA APOD API
- Font Awesome Icons

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- NASA API key (optional)

### Quick Start
1. Clone the repository:
```bash
git clone https://github.com/oop7/nasa-apod-gallery.git
```

2. Open `index.html` in your browser
3. Start exploring the cosmos! 🌠

### API Configuration
The project uses NASA's APOD API. While the default API key works, you can replace it with your own:

1. Get your API key from [NASA API Portal](https://api.nasa.gov/)
2. Open `script.js`
3. Replace the API key:
```javascript
const apiKey = 'GW79mC0zansrxxmlzORH5et1G4D7R6kbhgOOsrQw';
```

## 📱 Usage Guide

### Viewing Images
1. Select a date range using the date pickers
2. Click "Fetch Pictures" to load images
3. Scroll through the gallery
4. Double-click any image for full-screen view

### Image Actions
- ❤️ Click heart icon to save to favorites
- 📤 Use share button for social media sharing
- ⬇️ Download images directly to your device

### Navigation
- 🖱️ Scroll down for infinite loading
- ⌨️ Use ESC key to exit full-screen view
- 🔄 Clear results with the clear button

## 🎨 Customization

### Color Scheme
The app supports both light and dark modes, automatically matching your system preferences. To modify the color scheme, edit the CSS variables in `style.css`:

```css
:root {
    --primary-color: #4299e1;
    --background-color: #f6f9fc;
    /* ... other variables */
}
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NASA for providing the APOD API
- [Font Awesome](https://fontawesome.com/) for icons
- All contributors and users of this project

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/nasa-apod-gallery](https://github.com/yourusername/nasa-apod-gallery)

---
Made with ❤️ by [Your Name]

