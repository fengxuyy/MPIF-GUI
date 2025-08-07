import {
  MPIFData,
  MPIFMetadata,
  AuthorDetails,
  ProductInfo,
  SynthesisGeneral,
  SynthesisDetails,
  Characterization,
  PXRDData,
  TGAData,
  AdsorptionData,
  DesorptionData
} from '@/types/mpif';

export class MPIFParser {
  private lines: string[] = [];

  /**
   * Parse MPIF file content to structured data
   */
  public parse(content: string): MPIFData {
    // Keep all lines including empty ones for proper parsing of text blocks
    this.lines = content.split('\n').map(line => line.trim());

    const data: MPIFData = {
      metadata: this.parseMetadata(),
      authorDetails: this.parseAuthorDetails(),
      productInfo: this.parseProductInfo(),
      synthesisGeneral: this.parseSynthesisGeneral(),
      synthesisDetails: this.parseSynthesisDetails(),
      characterization: this.parseCharacterization()
    };

    return data;
  }

  /**
   * Convert structured data back to MPIF format
   */
  public stringify(data: MPIFData): string {
    let result = '';

    // Data block name
    result += `data_${data.metadata.dataName}\n`;
    
    // Metadata
    result += `_mpif_audit_creation_date\t${data.metadata.creationDate}\n`;
    result += `_mpif_audit_generator_version\t${data.metadata.generatorVersion}\n`;
    if (data.metadata.publicationDOI) {
      result += `_mpif_audit_publication_doi\t'${data.metadata.publicationDOI}'\n`;
    } else {
      result += `_mpif_audit_publication_doi\t''\n`;
    }
    result += `_mpif_audit_procedure_status\t'${data.metadata.procedureStatus}'\n\n`;

    // Section 1: Author Details
    result += '#Section 1: Author details\n';
    result += `_mpif_audit_contact_author_name\t'${data.authorDetails.name}'\n`;
    result += `_mpif_audit_contact_author_email\t${data.authorDetails.email}\n`;
    result += `_mpif_audit_contact_author_id_orcid\t${data.authorDetails.orcid}\n`;
    result += `_mpif_audit_contact_author_address\t'${data.authorDetails.address || ''}'\n`;
    result += `_mpif_audit_contact_author_phone\t${data.authorDetails.phone || '?'}\n\n`;

    // Section 2: Product Information
    result += '#Section 2: Product General Information\n';
    result += `_mpif_product_type\t'${data.productInfo.type}'\n`;
    result += `_mpif_product_cas\t${data.productInfo.casNumber || '?'}\n`;
    result += `_mpif_product_ccdc\t'${data.productInfo.ccdcNumber || ''}'\n`;
    result += `_mpif_product_name_common\t'${data.productInfo.commonName}'\n`;
    result += `_mpif_product_name_systematic\t'${data.productInfo.systematicName || ''}'\n`;
    result += `_mpif_product_formula\t'${data.productInfo.formula || ''}'\n`;
    result += `_mpif_product_formula_weight\t${data.productInfo.formulaWeight || ''}\n`;
    result += `_mpif_product_state\t'${data.productInfo.state}'\n`;
    result += `_mpif_product_color\t'${data.productInfo.color}'\n`;
    result += `_mpif_product_handling_atmosphere\t'${data.productInfo.handlingAtmosphere}'\n`;
    result += `_mpif_product_handling_note\n;\n${data.productInfo.handlingNote || ''}\n;\n\n`;

    // Section 3: Synthesis General Information
    result += '#Section 3: Synthesis General Information\n';
    result += `_mpif_synthesis_performed_date\t${data.synthesisGeneral.performedDate}\n`;
    result += `_mpif_synthesis_lab_temperature_C\t${data.synthesisGeneral.labTemperature}\n`;
    result += `_mpif_synthesis_lab_humidity_percent\t${data.synthesisGeneral.labHumidity}\n`;
    result += `_mpif_synthesis_type\t'${data.synthesisGeneral.reactionType}'\n`;
    result += `_mpif_synthesis_react_temperature_C\t${data.synthesisGeneral.reactionTemperature}\n`;
    result += `_mpif_synthesis_react_temperature_controller\t'${data.synthesisGeneral.temperatureController}'\n`;
    result += `_mpif_synthesis_react_time\t${data.synthesisGeneral.reactionTime}\n`;
    result += `_mpif_synthesis_react_time_unit\t'${data.synthesisGeneral.reactionTimeUnit}'\n`;
    result += `_mpif_synthesis_react_atmosphere\t'${data.synthesisGeneral.reactionAtmosphere}'\n`;
    result += `_mpif_synthesis_react_container\t'${data.synthesisGeneral.reactionContainer}'\n`;
    result += `_mpif_synthesis_react_note\n;\n${data.synthesisGeneral.reactionNote || ''}\n;\n`;
    result += `_mpif_synthesis_product_amount\t${data.synthesisGeneral.productAmount}\n`;
    result += `_mpif_synthesis_product_amount_unit\t'${data.synthesisGeneral.productAmountUnit}'\n`;
    if (data.synthesisGeneral.productYield) {
      result += `_mpif_synthesis_product_yield_percent\t${data.synthesisGeneral.productYield}\n`;
    }
    result += `_mpif_synthesis_scale\t'${data.synthesisGeneral.scale}'\n`;
    result += `_mpif_synthesis_safety_note\n;\n${data.synthesisGeneral.safetyNote || ''}\n;\n\n`;

    // Section 4: Synthesis Details
    result += '#Section 4: Synthesis Procedure Details\n';
    
    // Substrates
    if (data.synthesisDetails.substrates.length > 0) {
      result += `_mpif_substrate_number\t${data.synthesisDetails.substrates.length}\n`;
      result += 'loop_\n';
      result += '_mpif_substrate_id\n_mpif_substrate_name\n_mpif_substrate_molarity\n_mpif_substrate_molarity_unit\n_mpif_substrate_amount\n_mpif_substrate_amount_unit\n_mpif_substrate_supplier\n_mpif_substrate_purity_percent\n_mpif_substrate_cas\n_mpif_substrate_smiles\n';
      
      data.synthesisDetails.substrates.forEach(substrate => {
        result += `${substrate.id}\t${substrate.name}\t${substrate.molarity || ''}\t${substrate.molarityUnit || ''}\t${substrate.amount}\t${substrate.amountUnit}\t${substrate.supplier || ''}\t${substrate.purity || ''}\t${substrate.casNumber || ''}\t${substrate.smiles || '?'}\n`;
      });
      result += '\n';
    }

    // Solvents
    if (data.synthesisDetails.solvents.length > 0) {
      result += `_mpif_solvent_number\t${data.synthesisDetails.solvents.length}\n`;
      result += 'loop_\n';
      result += '_mpif_solvent_id\n_mpif_solvent_name\n_mpif_solvent_molarity\n_mpif_solvent_molarity_unit\n_mpif_solvent_amount\n_mpif_solvent_amount_unit\n_mpif_solvent_supplier\n_mpif_solvent_purity_percent\n_mpif_solvent_cas\n_mpif_solvent_smiles\n';
      
      data.synthesisDetails.solvents.forEach(solvent => {
        result += `${solvent.id}\t${solvent.name}\t${solvent.molarity || ''}\t${solvent.molarityUnit || ''}\t${solvent.amount}\t${solvent.amountUnit}\t${solvent.supplier || ''}\t${solvent.purity || ''}\t${solvent.casNumber || ''}\t${solvent.smiles || '?'}\n`;
      });
      result += '\n';
    }

    // Vessels
    if (data.synthesisDetails.vessels.length > 0) {
      result += `_mpif_vessel_number\t${data.synthesisDetails.vessels.length}\n`;
      result += 'loop_\n';
      result += '_mpif_vessel_id\n_mpif_vessel_volume\n_mpif_vessel_volume_unit\n_mpif_vessel_material\n_mpif_vessel_type\n_mpif_vessel_supplier\n_mpif_vessel_purpose\n_mpif_vessel_note\n';
      
      data.synthesisDetails.vessels.forEach(vessel => {
        result += `${vessel.id}\t${vessel.volume}\t${vessel.volumeUnit}\t${vessel.material}\t${vessel.type}\t${vessel.supplier || '-'}\t${vessel.purpose}\t${vessel.note || '-'}\n`;
      });
      result += '\n';
    }

    // Hardware
    if (data.synthesisDetails.hardware.length > 0) {
      result += `_mpif_hardware_number\t${data.synthesisDetails.hardware.length}\n`;
      result += 'loop_\n';
      result += '_mpif_hardware_id\n_mpif_hardware_purpose\n_mpif_hardware_general_name\n_mpif_hardware_product_name\n_mpif_hardware_supplier\n_mpif_hardware_note\n';
      
      data.synthesisDetails.hardware.forEach(hardware => {
        result += `${hardware.id}\t${hardware.purpose}\t${hardware.generalName}\t${hardware.productName || ''}\t${hardware.supplier || ''}\t${hardware.note || '-'}\n`;
      });
      result += '\n';
    }

    // Procedure Steps
    if (data.synthesisDetails.steps.length > 0) {
      result += `_mpif_procedure_number\t${data.synthesisDetails.steps.length}\n`;
      result += 'loop_\n';
      result += '_mpif_procedure_id\n_mpif_procedure_type\n_mpif_procedure_atmosphere\n_mpif_procedure_detail\n';
      
      data.synthesisDetails.steps.forEach(step => {
        result += `${step.id}\t${step.type}\t${step.atmosphere}\t${step.detail}\n`;
      });
      result += '\n';
    }

    if (data.synthesisDetails.procedureFull) {
      result += `_mpif_procedure_full\n;\n${data.synthesisDetails.procedureFull}\n;\n\n`;
    }

    // Characterization
    if (data.characterization.pxrd || data.characterization.tga || data.characterization.aif) {
      result += '#Characterization Information\n\n';
      
      if (data.characterization.pxrd) {
        result += '_mpif_pxrd_data\n;\n';
        result += `_mpif_pxrd_source\t'${data.characterization.pxrd.source}'\n`;
        if (data.characterization.pxrd.wavelength) {
          result += `_mpif_pxrd_lambda\t${data.characterization.pxrd.wavelength}\n`;
        }
        result += 'loop_\n_pxrd_2theta\n_pxrd_intensity\n';
        data.characterization.pxrd.data.forEach(point => {
          result += `${point.twoTheta}\t${point.intensity}\n`;
        });
        result += ';\n\n';
      }

      if (data.characterization.tga) {
        result += '_mpif_tga_data\n;\nloop_\n_tga_temperature_celcius\n_tga_weight_percent';
        data.characterization.tga.data.forEach(point => {
          result += `${point.temperature}\t${point.weightPercent}\n`;
        });
        result += ';\n\n';
      }

      if (data.characterization.aif) {
        result += `_mpif_aif\n;\n${data.characterization.aif}\n;\n`;
      }
    }

    return result;
  }

  private parseMetadata(): MPIFMetadata {
    const metadata: Partial<MPIFMetadata> = {};
    
    // Parse data block name
    const dataLine = this.findLine(/^data_(.+)$/);
    metadata.dataName = dataLine ? dataLine[1] : '';

    metadata.creationDate = this.extractValue('_mpif_audit_creation_date') || '';
    metadata.generatorVersion = this.extractValue('_mpif_audit_generator_version') || '';
    metadata.publicationDOI = this.extractValue('_mpif_audit_publication_doi')?.replace(/'/g, '') || '';
    metadata.procedureStatus = this.extractValue('_mpif_audit_procedure_status')?.replace(/'/g, '') as any || 'test';

    return metadata as MPIFMetadata;
  }

  private parseAuthorDetails(): AuthorDetails {
    return {
      name: this.extractValue('_mpif_audit_contact_author_name')?.replace(/'/g, '') || '',
      email: this.extractValue('_mpif_audit_contact_author_email') || '',
      orcid: this.extractValue('_mpif_audit_contact_author_id_orcid') || '',
      address: this.extractValue('_mpif_audit_contact_author_address')?.replace(/'/g, '') || '',
      phone: this.extractValue('_mpif_audit_contact_author_phone') || ''
    };
  }

  private parseProductInfo(): ProductInfo {
    return {
      type: this.extractValue('_mpif_product_type')?.replace(/'/g, '') as any || 'other',
      casNumber: this.extractValue('_mpif_product_cas'),
      ccdcNumber: this.extractValue('_mpif_product_ccdc')?.replace(/'/g, ''),
      commonName: this.extractValue('_mpif_product_name_common')?.replace(/'/g, '') || '',
      systematicName: this.extractValue('_mpif_product_name_systematic')?.replace(/'/g, ''),
      formula: this.extractValue('_mpif_product_formula')?.replace(/'/g, ''),
      formulaWeight: parseFloat(this.extractValue('_mpif_product_formula_weight') || '0') || undefined,
      state: this.extractValue('_mpif_product_state')?.replace(/'/g, '') as any || 'solid',
      color: this.extractValue('_mpif_product_color')?.replace(/'/g, '') || '#000000',
      handlingAtmosphere: this.extractValue('_mpif_product_handling_atmosphere')?.replace(/'/g, '') as any || 'air',
      handlingNote: this.extractTextBlock('_mpif_product_handling_note')
    };
  }

  private parseSynthesisGeneral(): SynthesisGeneral {
    const synthesis: any = {
      performedDate: this.extractValue('_mpif_synthesis_performed_date') || '',
      labTemperature: parseFloat(this.extractValue('_mpif_synthesis_lab_temperature_C') || '0'),
      labHumidity: parseFloat(this.extractValue('_mpif_synthesis_lab_humidity_percent') || '0'),
      reactionType: this.extractValue('_mpif_synthesis_type')?.replace(/'/g, '') || 'mix',
      reactionTemperature: parseFloat(this.extractValue('_mpif_synthesis_react_temperature_C') || '0'),
      temperatureController: this.extractValue('_mpif_synthesis_react_temperature_controller')?.replace(/'/g, '') || 'ambient',
      reactionTime: parseFloat(this.extractValue('_mpif_synthesis_react_time') || '0'),
      reactionTimeUnit: this.extractValue('_mpif_synthesis_react_time_unit')?.replace(/'/g, '') || 'h',
      reactionAtmosphere: this.extractValue('_mpif_synthesis_react_atmosphere')?.replace(/'/g, '') || 'air',
      reactionContainer: this.extractValue('_mpif_synthesis_react_container')?.replace(/'/g, '') || '',
      reactionNote: this.extractTextBlock('_mpif_synthesis_react_note'),
      productAmount: parseFloat(this.extractValue('_mpif_synthesis_product_amount') || '0'),
      productAmountUnit: this.extractValue('_mpif_synthesis_product_amount_unit')?.replace(/'/g, '') || 'mg',
      productYield: parseFloat(this.extractValue('_mpif_synthesis_product_yield_percent') || '0') || undefined,
      scale: this.extractValue('_mpif_synthesis_scale')?.replace(/'/g, '') || 'milligram',
      safetyNote: this.extractTextBlock('_mpif_synthesis_safety_note')
    };

    return synthesis;
  }

  private parseSynthesisDetails(): SynthesisDetails {
    return {
      substrates: this.parseLoopData('substrate', [
        'id', 'name', 'molarity', 'molarityUnit', 'amount', 'amountUnit', 
        'supplier', 'purity', 'casNumber', 'smiles'
      ]),
      solvents: this.parseLoopData('solvent', [
        'id', 'name', 'molarity', 'molarityUnit', 'amount', 'amountUnit', 
        'supplier', 'purity', 'casNumber', 'smiles'
      ]),
      vessels: this.parseLoopData('vessel', [
        'id', 'volume', 'volumeUnit', 'material', 'type', 'supplier', 'purpose', 'note'
      ]),
      hardware: this.parseLoopData('hardware', [
        'id', 'purpose', 'generalName', 'productName', 'supplier', 'note'
      ]),
      steps: this.parseLoopData('procedure', [
        'id', 'type', 'atmosphere', 'detail'
      ]),
      procedureFull: this.extractTextBlock('_mpif_procedure_full')
    };
  }

  private parseCharacterization(): Characterization {
    const characterization: Characterization = {};

    // Parse PXRD data
    const pxrdStartIndex = this.findLineIndex('_mpif_pxrd_data');
    if (pxrdStartIndex !== -1) {
      const pxrd: Partial<PXRDData> = {
        data: []
      };

      let inLoopData = false;
      let foundDataEnd = false;
      
      for (let i = pxrdStartIndex + 1; i < this.lines.length && !foundDataEnd; i++) {
        const line = this.lines[i];
        
        if (line === ';' && inLoopData) {
          foundDataEnd = true;
          break;
        } else if (line.includes('_mpif_pxrd_source')) {
          pxrd.source = line.split('\t')[1]?.replace(/'/g, '') as any;
        } else if (line.includes('_mpif_pxrd_lambda')) {
          pxrd.wavelength = parseFloat(line.split('\t')[1]);
        } else if (line.includes('_pxrd_2theta') || line.includes('_pxrd_intensity')) {
          inLoopData = true;
        } else if (inLoopData && line.includes('\t') && !line.startsWith('_')) {
          const parts = line.split('\t');
          if (parts.length >= 2) {
            const twoTheta = parseFloat(parts[0]);
            const intensity = parseFloat(parts[1]);
            if (!isNaN(twoTheta) && !isNaN(intensity)) {
              pxrd.data!.push({
                twoTheta,
                intensity
              });
            }
          }
        } else if (line.startsWith('_mpif_') && inLoopData) {
          // New section started, stop parsing PXRD
          foundDataEnd = true;
        }
      }
      
      if (pxrd.data!.length > 0) {
        characterization.pxrd = pxrd as PXRDData;
      }
    }

    // Parse TGA data
    const tgaStartIndex = this.findLineIndex('_mpif_tga_data');
    if (tgaStartIndex !== -1) {
      const tga: TGAData = { data: [] };
      
      let inLoopData = false;
      let foundDataEnd = false;
      
      for (let i = tgaStartIndex + 1; i < this.lines.length && !foundDataEnd; i++) {
        const line = this.lines[i];
        
        if (line === ';' && inLoopData) {
          foundDataEnd = true;
          break;
        } else if (line.includes('_tga_temperature_celcius') || line.includes('_tga_weight_percent')) {
          inLoopData = true;
        } else if (inLoopData && line.includes('\t') && !line.startsWith('_')) {
          const parts = line.split('\t');
          if (parts.length >= 2) {
            const temperature = parseFloat(parts[0]);
            const weightPercent = parseFloat(parts[1]);
            if (!isNaN(temperature) && !isNaN(weightPercent)) {
              tga.data.push({
                temperature,
                weightPercent
              });
            }
          }
        } else if (line.startsWith('_mpif_') && inLoopData) {
          // New section started, stop parsing TGA
          foundDataEnd = true;
        }
      }
      
      if (tga.data.length > 0) {
        characterization.tga = tga;
      }
    }

    // Parse Adsorption data
    const adsorptionStartIndex = this.findLineIndex('_adsorp_pressure');
    if (adsorptionStartIndex !== -1) {
      const adsorption: Partial<AdsorptionData> = {
        data: [],
        units: {}
      };

      // Parse metadata before the loop
      for (let i = 0; i < adsorptionStartIndex; i++) {
        const line = this.lines[i];
        if (line.includes('_exptl_temperature')) {
          adsorption.experimentalTemperature = parseFloat(line.split('\t')[1]);
        } else if (line.includes('_exptl_method')) {
          adsorption.experimentalMethod = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_adsnt_sample_mass')) {
          adsorption.sampleMass = parseFloat(line.split('\t')[1]);
        } else if (line.includes('_adsnt_sample_id')) {
          adsorption.sampleId = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_adsnt_material_id')) {
          adsorption.materialId = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_adsnt_info')) {
          adsorption.sampleInfo = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_units_temperature')) {
          adsorption.units!.temperature = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_units_pressure')) {
          adsorption.units!.pressure = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_units_mass')) {
          adsorption.units!.mass = line.split('\t')[1]?.replace(/'/g, '');
        } else if (line.includes('_units_loading')) {
          adsorption.units!.loading = line.split('\t')[1]?.replace(/'/g, '');
        }
      }

      let inLoopData = false;
      let foundDataEnd = false;
      
      for (let i = adsorptionStartIndex + 1; i < this.lines.length && !foundDataEnd; i++) {
        const line = this.lines[i];
        
        if (line.includes('_adsorp_p0') || line.includes('_adsorp_amount')) {
          inLoopData = true;
        } else if (inLoopData && line.includes('\t') && !line.startsWith('_')) {
          const parts = line.split('\t');
          if (parts.length >= 3) {
            const pressure = parseFloat(parts[0]);
            const p0 = parseFloat(parts[1]);
            const amount = parseFloat(parts[2]);
            if (!isNaN(pressure) && !isNaN(p0) && !isNaN(amount)) {
              adsorption.data!.push({
                pressure,
                p0,
                amount
              });
            }
          }
        } else if (line.startsWith('_desorp_') || line.startsWith('#') || line === '') {
          // New section started, stop parsing adsorption
          foundDataEnd = true;
        }
      }
      
      if (adsorption.data!.length > 0) {
        characterization.adsorption = adsorption as AdsorptionData;
      }
    }

    // Parse Desorption data
    const desorptionStartIndex = this.findLineIndex('_desorp_pressure');
    if (desorptionStartIndex !== -1) {
      const desorption: DesorptionData = { data: [] };
      
      let inLoopData = false;
      let foundDataEnd = false;
      
      for (let i = desorptionStartIndex + 1; i < this.lines.length && !foundDataEnd; i++) {
        const line = this.lines[i];
        
        if (line.includes('_desorp_p0') || line.includes('_desorp_amount')) {
          inLoopData = true;
        } else if (inLoopData && line.includes('\t') && !line.startsWith('_')) {
          const parts = line.split('\t');
          if (parts.length >= 3) {
            const pressure = parseFloat(parts[0]);
            const p0 = parseFloat(parts[1]);
            const amount = parseFloat(parts[2]);
            if (!isNaN(pressure) && !isNaN(p0) && !isNaN(amount)) {
              desorption.data.push({
                pressure,
                p0,
                amount
              });
            }
          }
        } else if (line.startsWith('_') && !line.startsWith('_desorp_') || line.startsWith('#')) {
          // New section started, stop parsing desorption
          foundDataEnd = true;
        }
      }
      
      if (desorption.data.length > 0) {
        characterization.desorption = desorption;
      }
    }

    // Parse AIF data
    const aifData = this.extractTextBlock('_mpif_aif');
    if (aifData) {
      characterization.aif = aifData;
    }

    return characterization;
  }

  private parseLoopData(type: string, fields: string[]): any[] {
    const numberKey = `_mpif_${type}_number`;
    const count = parseInt(this.extractValue(numberKey) || '0');
    
    if (count === 0) return [];

    const results: any[] = [];
    const loopStart = this.findLineIndex(`_mpif_${type}_id`);
    
    if (loopStart === -1) return [];

    // Skip header lines to get to data
    let dataStart = loopStart;
    for (let i = loopStart; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (!line.startsWith('_mpif_') && !line.startsWith('loop_') && line.trim() !== '') {
        dataStart = i;
        break;
      }
    }

    let itemsParsed = 0;
    for (let i = dataStart; i < this.lines.length && itemsParsed < count; i++) {
      const line = this.lines[i];
      
      // Stop if we hit a new section
      if (line.startsWith('_mpif_') || line.startsWith('#') || line === '') {
        break;
      }
      
      const values = line.split('\t');
      if (values.length < fields.length) continue; // Skip malformed lines
      
      const item: any = {};
      
      fields.forEach((field, index) => {
        let value = values[index] || '';
        
        // Type conversion
        if (['molarity', 'amount', 'purity', 'volume'].includes(field)) {
          const numValue = parseFloat(value);
          item[field] = isNaN(numValue) ? undefined : numValue;
        } else {
          // Clean up string values
          value = value.trim();
          item[field] = (value === '?' || value === '-' || value === '') ? undefined : value;
        }
      });
      
      results.push(item);
      itemsParsed++;
    }

    return results;
  }

  private extractValue(key: string): string | undefined {
    const line = this.lines.find(line => line.startsWith(key));
    if (!line) return undefined;
    
    const parts = line.split('\t');
    return parts.length > 1 ? parts[1] : undefined;
  }

  private extractTextBlock(key: string): string | undefined {
    const startIndex = this.findLineIndex(key);
    if (startIndex === -1) return undefined;

    let content = '';
    let inBlock = false;
    let foundStart = false;
    
    for (let i = startIndex + 1; i < this.lines.length; i++) {
      const line = this.lines[i];
      
      if (line === ';') {
        if (inBlock) {
          break; // End of block
        } else {
          inBlock = true; // Start of block
          foundStart = true;
        }
      } else if (inBlock) {
        content += (content ? '\n' : '') + line;
      } else if (!foundStart && line.trim() !== '' && !line.startsWith('_') && !line.startsWith('#')) {
        // Handle cases where text block doesn't start with semicolon
        content += (content ? '\n' : '') + line;
        // Look ahead to see if we encounter a semicolon or new section
        let nextLineIndex = i + 1;
        while (nextLineIndex < this.lines.length) {
          const nextLine = this.lines[nextLineIndex];
          if (nextLine === ';') {
            i = nextLineIndex; // Skip to the closing semicolon
            break;
          } else if (nextLine.startsWith('_') || nextLine.startsWith('#')) {
            i = nextLineIndex - 1; // Step back one line
            break;
          } else if (nextLine.trim() !== '') {
            content += '\n' + nextLine;
          }
          nextLineIndex++;
        }
        break;
      }
    }

    return content.trim() || undefined;
  }

  private findLine(pattern: RegExp): RegExpMatchArray | null {
    for (const line of this.lines) {
      const match = line.match(pattern);
      if (match) return match;
    }
    return null;
  }

  private findLineIndex(searchText: string): number {
    return this.lines.findIndex(line => line.startsWith(searchText));
  }
}

// Export convenience functions
export const parseMPIF = (content: string): MPIFData => {
  const parser = new MPIFParser();
  return parser.parse(content);
};

export const stringifyMPIF = (data: MPIFData): string => {
  const parser = new MPIFParser();
  return parser.stringify(data);
}; 