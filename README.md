# MPIF Dashboard

A modern web application for managing and visualizing MPIF (Materials Property Information Format) data. This application provides an intuitive interface for data entry, file upload, and visualization of materials characterization data.

## Features

- **Interactive Dashboard**: Modern, responsive UI for data management
- **File Upload Support**: Upload and parse AIF and CIF files
- **Data Visualization**: Charts and graphs for data analysis
- **Form-based Data Entry**: Structured forms for metadata, characterization, and synthesis details
- **Real-time Validation**: Form validation with TypeScript and Zod
- **Export Capabilities**: Generate MPIF files from entered data

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Docker** (for containerized deployment)
- **Python 3.8+** (for backend services)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MPIF-GUI
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (if using Python backend)
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Start the Development Server

```bash
# Start the backend database API
npm run dev:api

# Start the frontend development server
npm run dev
```

The application will be available at `http://localhost:5173`. The backend API runs at `http://127.0.0.1:8000`, and Vite proxies `/api` requests to it.

Published files are stored in a SQLite database at `backend/mpif_publish.sqlite3` by default. To use a different database file, set `MPIF_DB_PATH` before starting the API.

### 4. Available Scripts

- `npm run dev` - Start development server
- `npm run dev:api` - Start the backend database API
- `npm run dev:ngrok` - Start the backend API, frontend, and ngrok tunnel together
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Docker Deployment

### 1. Build the Docker Image

```bash
docker build -t mpif-gui .
```

### 2. Run the Container

```bash
# Run the container
docker run -p 8080:80 mpif-gui

# Or run in detached mode
docker run -d -p 8080:80 --name msif-gui-container mpif-gui
```

The application will be available at `http://localhost:8080`

### 3. Docker Compose (Optional)

Create a `docker-compose.yml` file for easier management:

```yaml
version: '3.8'
services:
  msif-gui:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Then run:
```bash
docker-compose up -d
```

## Project Structure

```
MSIF-GUI/
├── src/
│   ├── components/          # React components
│   │   ├── forms/          # Form components
│   │   └── ui/             # UI components
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── backend/                # Python backend services
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
└── package.json           # Node.js dependencies
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling

### State Management
- Use Zustand for global state
- Keep component state local when possible
- Use React Hook Form for form management

### File Structure
- Keep components small and focused
- Use proper TypeScript interfaces
- Follow the established folder structure

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Docker build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   ```

3. **Dependencies issues**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg

---

## Roadmap & To-Do List

### 🚀 Build LLM Backend

- [ ] Implement a backend service powered by an LLM
- [ ] Allow users to paste a paragraph of text
- [ ] Automatically extract and parse the relevant information
- [ ] Map extracted information into predefined fields to facilitate file generation

### 🗄️ Build Database Layer

- [ ] Design a database schema to store parsed outputs
- [x] Support saving in both JSON format
- [ ] Ensure compatibility for retrieval, editing, and exporting into required file formats

### ✅ Confirm Data Standards

- [ ] Verify all required fields for extraction
- [ ] Define standard formats for each field (e.g., data naming conventions, units, types)
- [ ] Ensure consistency between parsed outputs and file/database requirements

### 📚 Add Documentation

- [x] Write clear setup and usage instructions
- [x] Document required fields, formatting standards, and examples

---

## Support

For questions or issues, please:
1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information

## Changelog

### v1.1
- Initial release
- Basic dashboard functionality
- File upload support (AIF/CIF)
- Form-based data entry
- Data visualization components
