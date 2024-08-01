# NASA APOD Viewer

A web application that displays NASA's Astronomy Picture of the Day (APOD) images. Users can select date ranges to view images and double-click to view them in full screen.

## 💪 Features

- Fetch and display NASA's Astronomy Picture of the Day (APOD) images.
- Select custom date ranges to view images from specific periods.
- View images in a larger scale by double-clicking them.
- Responsive and user-friendly design.

## 🧩 Technologies Used

- HTML
- CSS
- JavaScript

 ## 🔽 Download
 
You can download the most recent version of tool [here](https://codeload.github.com/oop7/nasa-apod-gallery/zip/refs/heads/main)

## ⚙️ Setup and Installation

### 1. open `index.html`
You can open `index.html` in your web browser to view the application.

## 🛠️ Configuration

### 1. API Key
This project uses the NASA API. You need to replace the API key in `script.js` with your own:
```js
const apiKey = 'GW79mC0zansrxxmlzORH5et1G4D7R6kbhgOOsrQw'; // Your NASA API key
```
### 2. Date Format
Ensure the date format used in the date pickers is `YYYY-MM-DD`.

## 💻 Usage

### 1. Select Date Range
- Use the date pickers to select a start date and an end date.
- Click the "Fetch Pictures" button to retrieve images from NASA's APOD API for the selected date range.

### 2. View Images

- Images will be displayed below the date pickers.
- Double-click on any image to view it in full screen.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📙 Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

