# EEG Management System

A comprehensive web-based system for managing and analyzing EEG (Electroencephalogram) data, designed for medical professionals to efficiently handle patient records, EEG recordings, and generate detailed reports.

## Features

- **User Authentication**: Secure login system with role-based access (Doctor, Patient, Staff)
- **Dashboard**: Personalized dashboards for different user types
- **Patient Management**: Comprehensive patient records and history
- **EEG Recording Management**: Upload, view, and analyze EEG recordings
- **EEG Annotation**: Tools for annotating EEG recordings with events and markers
- **Analysis Tools**: Advanced analysis features for EEG data
- **Report Generation**: Create, view, and print detailed EEG reports
- **Account Management**: User profile and password management

## System Requirements

### Hardware Requirements
- Processor: Intel Core i5 or equivalent
- RAM: 8GB minimum (16GB recommended)
- Storage: 500MB free space
- Display: 1920x1080 resolution or higher

### Software Requirements

#### For Windows:
- Windows 10 or later
- [Node.js](https://nodejs.org/) (v14.0.0 or later)
- [Git](https://git-scm.com/download/win)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or later)

#### For macOS:
- macOS 10.15 (Catalina) or later
- [Node.js](https://nodejs.org/) (v14.0.0 or later)
- [Git](https://git-scm.com/download/mac)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or later)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eeg-management-system.git
   cd eeg-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/eeg-management
   JWT_SECRET=your_jwt_secret
   ```

4. **Start MongoDB**
   - Windows: Start MongoDB service
   - macOS: Run `brew services start mongodb-community`

5. **Run the application**
   ```bash
   npm start
   ```

6. **Access the application**
   Open your web browser and navigate to `http://localhost:3000`

## Project Structure

```
eeg-management-system/
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── doctor/              # Doctor-specific pages
├── patient/             # Patient-specific pages
├── staff/               # Staff-specific pages
├── full_edf_viewer/     # EEG viewer component
├── server/              # Backend server code
├── public/              # Static files
└── README.md            # Project documentation
```

## Usage

### Doctor Access
1. Login with doctor credentials
2. Access patient records and EEG data
3. Generate and manage reports
4. Analyze EEG recordings

### Patient Access
1. Login with patient credentials
2. View personal records and EEG history
3. Access reports and analysis results

### Staff Access
1. Login with staff credentials
2. Manage patient records
3. Handle administrative tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- EEG data visualization libraries
- Medical professionals for domain expertise
- Open source community

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/eeg-management-system](https://github.com/yourusername/eeg-management-system) 