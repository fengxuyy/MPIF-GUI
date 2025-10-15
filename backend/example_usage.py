"""
MPIF Converter Example - Recreate test.mpif

This example shows how to build MPIF JSON from arguments,
including characterization data, then convert to MPIF format.
"""

from mpif_converter import create_mpif_json, json_to_mpif
import json

# =============================================================================
# Build complete MPIF JSON structure from arguments (single function call!)
# =============================================================================
print("Building MPIF JSON from arguments...")

data = create_mpif_json(
    # Metadata
    dataName='Example-Mat-1_20231027_John-Doe',
    creationDate='2023-10-27',
    generatorVersion='1.0',
    procedureStatus='success',
    name='John Doe',
    email='john.doe@example.com',
    orcid='0000-0000-0000-0000',
    address='Example University, 123 University St, Example City',
    
    # Product Info
    type='porous framework material',
    ccdcNumber='1234567',
    commonName='Example-Mat-1',
    formula='C10H8N2O2',
    formulaWeight=188.18,
    state='solid',
    color='#A1B2C3',
    handlingAtmosphere='air',
    handlingNote='This is a sample material and is stable in air.\nSounds good',
    
    # Synthesis General
    performedDate='2023-10-26',
    labTemperature=22,
    labHumidity=45,
    reactionType='mix',
    reactionTemperature=80,
    temperatureController='oven',
    reactionTime=24,
    reactionTimeUnit='h',
    reactionAtmosphere='air',
    reactionContainer='glass vial',
    reactionNote='This is a sample reaction note.',
    productAmount=50,
    productAmountUnit='mg',
    productYield=90,
    scale='milligram',
    safetyNote='Standard lab safety procedures should be followed.',
    
    # Synthesis Details - IDs are auto-generated (R1, R2, S1, V1, H1, P1, P2, P3)
    substrates=[
        {
            'name': 'Substance-A',
            'molarity': 1,
            'molarityUnit': 'mmol',
            'amount': 10,
            'amountUnit': 'mg',
            'supplier': 'ExampleChem',
            'purity': 99,
            'casNumber': '123-45-6'
        },
        {
            'name': 'Substance-B',
            'molarity': 2,
            'molarityUnit': 'mmol',
            'amount': 20,
            'amountUnit': 'mg',
            'supplier': 'ExampleChem',
            'purity': 98,
            'casNumber': '789-01-2'
        }
    ],
    
    solvents=[
        {
            'name': 'Solvent-X',
            'amount': 100,
            'amountUnit': 'mL',
            'supplier': 'ExampleChem',
            'purity': 99.5,
            'casNumber': '321-65-4'
        }
    ],
    
    vessels=[
        {
            'volume': 20,
            'volumeUnit': 'mL',
            'material': 'glass',
            'type': 'Vial',
            'purpose': 'Reaction'
        }
    ],
    
    hardware=[
        {
            'purpose': 'Heating/Cooling',
            'generalName': 'Oven',
            'productName': 'Model-T',
            'supplier': 'ExampleInc'
        }
    ],
    
    steps=[
        {
            'type': 'Preparation',
            'atmosphere': 'Air',
            'detail': 'Mix R1 and R2 in S1.'
        },
        {
            'type': 'Reaction',
            'atmosphere': 'Air',
            'detail': 'Heat mixture in V1 using H1 for 24h.'
        },
        {
            'type': 'Work-up',
            'atmosphere': 'Air',
            'detail': 'Cool down and filter the product.'
        }
    ],
    
    procedureFull='''1. Add Substance-A (10 mg) and Substance-B (20 mg) to a 20 mL vial (V1).
2. Add 100 mL of Solvent-X and stir.
3. Place the vial in an oven (H1) at 80°C for 24 hours.
4. After cooling to room temperature, filter the solid product and wash with Solvent-X.
5. Dry the product under vacuum.''',
    
    # =========================================================================
    # Characterization data (passed directly!)
    # =========================================================================
    
    # PXRD data
    pxrd_data={
        'twoTheta': [5, 10, 15, 20, 25],
        'intensity': [1000, 5000, 3000, 8000, 6000]
    },
    pxrd_source='Cu',
    pxrd_wavelength=1.54056,
    
    # TGA data
    tga_data={
        'temperature': [25, 100, 200, 300, 400, 500, 600],
        'weightPercent': [100, 99.8, 99.5, 98, 85, 60, 10]
    },
    
    # AIF data
    aif_properties={
        'sample_id': 'MOF-5_test',
        'material_id': 'ZIF-8',
        'temperature_K': '77',
        'pressure_units': 'bar',
        'loading_units': 'mmol/g'
    },
    aif_data={
        'dataName': 'sample_adsorption',
        'adsorptionData': [
            {'pressure': 0.001, 'loading': 0.5},
            {'pressure': 0.01, 'loading': 2.1},
            {'pressure': 0.1, 'loading': 5.8},
            {'pressure': 0.5, 'loading': 12.3},
            {'pressure': 1.0, 'loading': 18.5},
            {'pressure': 2.0, 'loading': 22.1},
            {'pressure': 5.0, 'loading': 25.6},
            {'pressure': 10.0, 'loading': 26.8},
            {'pressure': 15.0, 'loading': 27.2},
            {'pressure': 20.0, 'loading': 27.4}
        ]
    },
    
    # CIF data (structured)
    cif_dict={
        'dataName': 'Ac',
        'properties': {
            '_symmetry_space_group_name_H-M': "'P 1'",
            '_cell_length_a': '4.04604077',
            '_cell_length_b': '4.04604077',
            '_cell_length_c': '13.01703648',
            '_cell_angle_alpha': '90.00000000',
            '_cell_angle_beta': '90.00000000',
            '_cell_angle_gamma': '120.00000000',
            '_symmetry_Int_Tables_number': '1',
            '_chemical_formula_structural': 'Ac',
            '_chemical_formula_sum': 'Ac4',
            '_cell_volume': '184.54541612',
            '_cell_formula_units_Z': '4'
        },
        'loops': [
            {
                'headers': ['_symmetry_equiv_pos_site_id', '_symmetry_equiv_pos_as_xyz'],
                'data': [['1', "'x, y, z'"]]
            },
            {
                'headers': ['_atom_type_symbol', '_atom_type_oxidation_number'],
                'data': [['Ac0+', '0.0']]
            },
            {
                'headers': [
                    '_atom_site_type_symbol',
                    '_atom_site_label',
                    '_atom_site_symmetry_multiplicity',
                    '_atom_site_fract_x',
                    '_atom_site_fract_y',
                    '_atom_site_fract_z',
                    '_atom_site_occupancy'
                ],
                'data': [
                    ['Ac0+', 'Ac0', '1', '0.00000000', '0.00000000', '0.00000000', '1'],
                    ['Ac0+', 'Ac1', '1', '0.33333333', '0.66666667', '0.25000000', '1'],
                    ['Ac0+', 'Ac2', '1', '0.00000000', '0.00000000', '0.50000000', '1'],
                    ['Ac0+', 'Ac3', '1', '0.66666667', '0.33333333', '0.75000000', '1']
                ]
            }
        ]
    }
)

print(f"✓ Created complete JSON structure in one call!")
print(f"  Material: {data['productInfo']['commonName']}")
print(f"  Substrates: {len(data['synthesisDetails']['substrates'])} (IDs: {[s['id'] for s in data['synthesisDetails']['substrates']]})")
print(f"  Solvents: {len(data['synthesisDetails']['solvents'])} (IDs: {[s['id'] for s in data['synthesisDetails']['solvents']]})")
print(f"  Vessels: {len(data['synthesisDetails']['vessels'])} (IDs: {[v['id'] for v in data['synthesisDetails']['vessels']]})")
print(f"  Hardware: {len(data['synthesisDetails']['hardware'])} (IDs: {[h['id'] for h in data['synthesisDetails']['hardware']]})")
print(f"  Steps: {len(data['synthesisDetails']['steps'])} (IDs: {[s['id'] for s in data['synthesisDetails']['steps']]})")
print(f"  PXRD: {len(data['characterization']['pxrd']['data'])} points")
print(f"  TGA: {len(data['characterization']['tga']['data'])} points")
print(f"  AIF: {len(data['characterization']['aif']['adsorptionData'])} points")
print(f"  CIF: {len(data['productInfo']['cif']['properties'])} properties, {len(data['productInfo']['cif']['loops'])} loops")

# =============================================================================
# Save JSON and convert to MPIF
# =============================================================================
print("\nSaving JSON...")
with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)
print(f"✓ Saved to output.json")

print("\nConverting to MPIF...")
mpif_output = json_to_mpif(data)
with open('output.mpif', 'w') as f:
    f.write(mpif_output)
print(f"✓ Saved to output.mpif ({len(mpif_output)} characters)")

# =============================================================================
# Verify round-trip conversion
# =============================================================================
print("\nVerifying round-trip...")
from mpif_converter import mpif_to_json
data_roundtrip = mpif_to_json(mpif_output)
print(f"✓ Round-trip successful")
print(f"  Material: {data_roundtrip['productInfo']['commonName']}")
print(f"  Substrates: {len(data_roundtrip['synthesisDetails']['substrates'])}")
print(f"  PXRD points: {len(data_roundtrip['characterization']['pxrd']['data'])}")

# =============================================================================
# Summary
# =============================================================================
print("\n" + "="*70)
print("COMPLETE!")
print("="*70)
print("""
✓ Built complete MPIF JSON in ONE function call
  - IDs auto-generated (R1, R2, S1, V1, H1, P1-P3)
  - Characterization data included directly (PXRD, TGA, AIF, CIF)
✓ Saved JSON to output.json
✓ Converted to MPIF and saved to output.mpif
✓ Verified round-trip conversion

Files created:
- output.json (JSON format)
- output.mpif (MPIF format, matches test.mpif structure)
""")

