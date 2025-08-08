# MPIF Dashboard

A modern React-based dashboard for viewing, validating, editing, and exporting **Material Preparation Information Files (MPIFs)** in .mpif format. Built specifically for researchers working with Metal-Organic Frameworks (MOFs) and other porous materials.

## 🚀 Features

### Core Functionality
- **📁 File Upload & Parsing**: Drag-and-drop or browse to upload .mpif files with comprehensive STAR format parsing
- **🎛️ Dashboard Layout**: Clean sidebar navigation with collapsible sections for each MPIF component
- **✏️ Editor**: Editable form fields with real-time validation and error highlighting
- **👀 Preview & Export**: Live preview of MPIF in raw format with download functionality
- **🔍 Validation**: Comprehensive input validation with field-specific error messages

### Advanced Features
- **🌓 Dark/Light Theme**: Toggle between themes with system persistence
- **💾 Auto-save**: Local storage backup with recovery options
- **📊 Visualization**: Ready for plotting PXRD patterns, TGA curves, and adsorption isotherms
- **🔗 Integration-ready**: Prepared for future ELN and repository API connections

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand with subscriptions
- **Form Handling**: react-hook-form with Zod validation
- **File Processing**: Custom STAR format parser
- **Charts**: Recharts (for future data visualization)
- **Build Tool**: Vite

## 📋 MPIF Structure

The application handles the complete MPIF specification with these sections:

### 1. Metadata
- File creation date and audit information
- Generator version and publication DOI
- Procedure status (test/success/failure)

### 2. Author Details (Section 1)
- Contact author name, email, ORCID
- Institution address and phone

### 3. Product Information (Section 2)
- Material type and classification
- Chemical identifiers (CAS, CCDC/CSD/ICSD)
- Physical properties (formula, state, color)
- Handling requirements and safety notes

### 4. Synthesis General (Section 3)
- Laboratory conditions (temperature, humidity)
- Reaction parameters (type, temperature, time, atmosphere)
- Product yield and scale information
- Special reaction type support:
  - Microwave-assisted (power settings)
  - Mechanochemical (method specification)
  - Electrochemical (electrode and electrical parameters)
  - Sonochemical (device and power configuration)
  - Photochemical (wavelength, power, light source)

### 5. Synthesis Details (Section 4)
- **Substrates**: Chemical reagents with molarity, amounts, supplier info
- **Solvents**: Reaction media with concentrations and volumes
- **Vessels**: Reaction containers with specifications
- **Hardware**: Equipment used (heating, mixing, purification)
- **Procedure Steps**: Detailed step-by-step synthesis protocol

### 6. Characterization
- **PXRD**: Powder X-ray diffraction data with source and wavelength
- **TGA**: Thermogravimetric analysis curves
- **AIF**: Adsorption Information Format integration

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── card.tsx
│   ├── Dashboard.tsx       # Main dashboard layout
│   └── FileUpload.tsx      # File upload component
├── store/
│   └── mpifStore.ts        # Zustand state management
├── types/
│   └── mpif.ts            # TypeScript interfaces
├── utils/
│   └── mpifParser.ts      # STAR format parser
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Main application
├── main.tsx              # React entry point
└── index.css             # Tailwind styles
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Modern web browser

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd mpif-dashboard
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Open browser** to http://localhost:5173

## 🐳 Docker Deployment

### Prerequisites
- Docker installed on your system
- Basic familiarity with Docker commands

### Quick Start with Docker

1. **Build the Docker image**:
```bash
docker build -t msif-gui .
```

2. **Run the container**:
```bash
docker run -p 3000:80 msif-gui
```

3. **Access the application**:
   - Open your browser to http://localhost:3000

### Docker Deployment Options

#### Development Mode
```bash
# Run in detached mode (background)
docker run -d -p 3000:80 --name msif-dashboard msif-gui

# View logs
docker logs msif-dashboard

# Stop the container
docker stop msif-dashboard

# Remove the container
docker rm msif-dashboard
```

#### Production Deployment
```bash
# Run on standard HTTP port
docker run -d -p 80:80 --name msif-production msif-gui

# Run with custom port
docker run -d -p 8080:80 --name msif-custom-port msif-gui

# Run with environment variables
docker run -d -p 3000:80 -e NODE_ENV=production --name msif-gui-prod msif-gui
```

#### Docker Compose (Recommended for Production)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  msif-gui:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    container_name: msif-dashboard
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

Then run:
```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Docker Features

#### Multi-Stage Build
- **Build Stage**: Uses Node.js 18 Alpine to compile TypeScript and build the Vite application
- **Production Stage**: Uses lightweight Nginx Alpine (~15MB) to serve static files

#### Optimized Configuration
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Gzip Compression**: Automatic compression for better performance
- **SPA Support**: Proper routing configuration for React Router
- **Health Checks**: Built-in health monitoring

#### Performance Features
- **Small Image Size**: Multi-stage build reduces final image to ~25MB
- **Fast Startup**: Nginx starts in <2 seconds
- **Caching**: Optimized Docker layer caching for faster rebuilds

### Troubleshooting Docker Deployment

#### Common Issues

1. **Port already in use**:
```bash
# Check what's using the port
lsof -i :3000

# Use a different port
docker run -p 3001:80 msif-gui
```

2. **Build failures**:
```bash
# Clean build without cache
docker build --no-cache -t msif-gui .

# Check build logs
docker build -t msif-gui . --progress=plain
```

3. **Container won't start**:
```bash
# Check container logs
docker logs msif-gui

# Run interactively for debugging
docker run -it --entrypoint /bin/sh msif-gui
```

#### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker build -t msif-gui .
docker stop msif-dashboard
docker rm msif-dashboard
docker run -d -p 3000:80 --name msif-dashboard msif-gui
```

### Usage

1. **Upload MPIF File**: Drag and drop a .mpif file or click to browse
2. **Navigate Sections**: Use the sidebar to switch between MPIF sections
3. **Edit Data**: Modify fields with real-time validation feedback
4. **Export Results**: Download the updated MPIF file

## 📝 Example MPIF Format

```
data_WaaF-1_20250311_Shun-Tokuda
_mpif_audit_creation_date	2025-03-11
_mpif_audit_generator_version	1.0.0
_mpif_audit_procedure_status	'success'

#Section 1: Author details
_mpif_audit_contact_author_name	'Shun Tokuda'
_mpif_audit_contact_author_email	s.tokuda@fkf.mpg.de
_mpif_audit_contact_author_id_orcid	0000-0002-4515-3073

#Section 2: Product General Information
_mpif_product_type	'porous framework material'
_mpif_product_name_common	'WaaF-1'
_mpif_product_formula	'C30 N2 Rh2'
_mpif_product_state	'solid'

#Section 3: Synthesis General Information
_mpif_synthesis_type	'mix'
_mpif_synthesis_react_temperature_C	100
_mpif_synthesis_react_time	16
_mpif_synthesis_react_time_unit	'h'

#Section 4: Synthesis Procedure Details
_mpif_substrate_number	2
loop_
_mpif_substrate_id
_mpif_substrate_name
_mpif_substrate_amount
_mpif_substrate_amount_unit
R1	metal_salt	10	mg
R2	ligand	33	mL
```

## 🔧 Development

### Key Components

- **MPIFParser**: Robust STAR format parser handling the complete MPIF specification
- **Zustand Store**: Centralized state management with validation and auto-save
- **Dashboard**: Responsive layout with sidebar navigation and content panels
- **FileUpload**: Drag-and-drop interface with validation and error handling

### Adding New Sections

1. Update TypeScript interfaces in `src/types/mpif.ts`
2. Extend the parser in `src/utils/mpifParser.ts`
3. Add validation rules in `src/store/mpifStore.ts`
4. Create form components for the new section

## 🎯 Future Enhancements

- **Data Visualization**: Interactive plotting of characterization data
- **ELN Integration**: Connect with Electronic Lab Notebooks
- **Repository APIs**: Integration with Chemotion and other databases
- **Batch Processing**: Support for multiple file operations
- **Collaboration**: User comments and reproducibility ratings
- **Advanced Validation**: Chemical structure validation and consistency checks

## 📚 Scientific Context

This application addresses critical needs in materials chemistry research:

- **Reproducibility Crisis**: Standardized reporting reduces synthesis variations
- **Data Management**: Structured format enables database integration
- **Community Standards**: Promotes adoption of MPIF across research groups
- **Machine Learning**: Structured data supports ML applications in materials discovery

## 🙏 Acknowledgments

- **Original MPIF Specification**: Shun Tokuda and Damian Jędrzejowski
- **EU4MOFs Initiative**: European MOF research community
- **shadcn/ui**: Component library foundation
- **Tailwind CSS**: Styling framework

---
