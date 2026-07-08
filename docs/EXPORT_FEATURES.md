# Export Features

## Overview

The MPIF Dashboard now supports two export formats:
1. **Export MPIF** - The standard MPIF text format
2. **Export Backend JSON** - JSON format compatible with the Python backend

## Export Backend JSON

The "Export Backend JSON" feature in the Actions dropdown allows you to export the current MPIF data in JSON format that's directly compatible with the Python backend converter functions.

### How to Use

1. In the Dashboard, click on **Actions** in the navbar
2. Select **Export Backend JSON**
3. Enter a filename (without extension)
4. Click **Export .json**

The exported JSON file will contain the complete MPIF data structure and can be used with the Python backend:

```python
from mpif_converter import mpif_to_json, json_to_mpif, create_mpif_json
import json

# Load the exported JSON from web app
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Convert to MPIF format
mpif_output = json_to_mpif(data)

# Or modify and re-export
data['productInfo']['commonName'] = 'New Name'
with open('modified.mpif', 'w') as f:
    f.write(json_to_mpif(data))
```

### JSON Structure

The exported JSON follows the same structure as the Python backend:

```json
{
  "metadata": {
    "dataName": "...",
    "creationDate": "...",
    "generatorVersion": "1.0",
    ...
  },
  "productInfo": {
    "commonName": "...",
    "formula": "...",
    "cif": "...",
    ...
  },
  "synthesisGeneral": {
    "reactionType": "...",
    "reactionTemperature": 80,
    ...
  },
  "synthesisDetails": {
    "substrates": [...],
    "solvents": [...],
    "vessels": [...],
    "hardware": [...],
    "steps": [...]
  },
  "characterization": {
    "pxrd": {...},
    "tga": {...},
    "aif": "..."
  }
}
```

### Workflow: Web App ↔ Python Backend

#### Web App → Python Backend
1. Create/edit data in web app
2. Export as Backend JSON
3. Load in Python and process with backend functions

#### Python Backend → Web App
1. Create data using `create_mpif_json()` in Python
2. Export as JSON using `json.dump()`
3. Upload JSON file in web app (if supported) or convert to MPIF first

### Features

✅ **Full Data Preservation**: All fields and nested structures are preserved
✅ **Backend Compatible**: Works directly with Python `mpif_converter.py` functions
✅ **Round-trip Support**: Export from web → Import to Python → Export to MPIF
✅ **Easy Integration**: Seamless workflow between web UI and Python scripts

## Actions Menu

The Actions dropdown now contains:
1. **Create New File** - Start a new MPIF file
2. **Upload File** - Load an existing MPIF file
3. **Export MPIF** - Export as MPIF text format
4. **Export Backend JSON** - Export as Python backend compatible JSON ⭐ NEW
5. **Column Switch** - Toggle single/double column layout

## Technical Details

### Implementation

The export feature directly serializes the `mpifData` state from the Zustand store:

```typescript
const jsonContent = JSON.stringify(mpifData, null, 2);
const blob = new Blob([jsonContent], { type: 'application/json' });
// ... download logic
```

### Data Format Compatibility

The web app's TypeScript types (`src/types/mpif.ts`) match the Python backend's JSON structure, ensuring seamless compatibility between:
- Web app exports
- Python `create_mpif_json()` output
- Python `mpif_to_json()` output

## Benefits

1. **Flexibility**: Work in the web UI, process in Python
2. **Automation**: Export from web, batch process in Python
3. **Integration**: Use web app for data entry, Python for analysis
4. **Collaboration**: Share JSON files between web and Python users
5. **Version Control**: JSON files are git-friendly for tracking changes

