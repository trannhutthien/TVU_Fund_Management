/**
 * Property-Based Test: Bug Condition - Invalid ENUM Value Rejection
 * 
 * This test is designed to FAIL on unfixed code to demonstrate the bug exists.
 * 
 * BUG CONDITION: Proposal submissions with invalid loai_ho_tro values 
 * (values not in database ENUM: 'Tai tro khong hoan lai', 'Tai tro co thu hoi', 'Cho vay')
 * cause MySQL "Data truncated" errors.
 * 
 * EXPECTED BEHAVIOR (after fix): All loai_ho_tro values sent to backend 
 * are valid ENUM values, resulting in successful proposal creation.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { LOAI_HO_TRO } from '../constants';

describe('Property 1: Bug Condition - Invalid ENUM Value Rejection', () => {
  const VALID_DATABASE_ENUM_VALUES = ['Tai tro khong hoan lai', 'Tai tro co thu hoi', 'Cho vay'];

  /**
   * CRITICAL TEST: This test should FAIL on unfixed code
   * 
   * On unfixed code, LOAI_HO_TRO constant contains "Trao tang" which is NOT in database ENUM.
   * After fix, all values in LOAI_HO_TRO should be valid database ENUM values.
   */
  it('Property 1: All LOAI_HO_TRO constant values are valid database ENUM values', () => {
    console.log('\n=== BUG CONDITION EXPLORATION TEST ===');
    console.log('Testing LOAI_HO_TRO constant values against database ENUM');
    console.log('Valid database ENUM values:', VALID_DATABASE_ENUM_VALUES);
    console.log('Current LOAI_HO_TRO values:', LOAI_HO_TRO.map(opt => opt.value));
    
    // Check each option in LOAI_HO_TRO
    const invalidValues = [];
    LOAI_HO_TRO.forEach((option, index) => {
      const isValid = VALID_DATABASE_ENUM_VALUES.includes(option.value);
      console.log(`\nOption ${index + 1}:`);
      console.log(`  Label: "${option.label}"`);
      console.log(`  Value: "${option.value}"`);
      console.log(`  Valid: ${isValid ? '✓' : '✗'}`);
      
      if (!isValid) {
        invalidValues.push(option.value);
        console.error(`  ⚠️  COUNTEREXAMPLE FOUND: "${option.value}" is NOT a valid database ENUM value`);
      }
    });

    if (invalidValues.length > 0) {
      console.error('\n=== BUG CONFIRMED ===');
      console.error(`Found ${invalidValues.length} invalid value(s):`, invalidValues);
      console.error('These values will cause "Data truncated for column \'loaihotro\'" MySQL error');
      console.error('\nRoot cause: Frontend LOAI_HO_TRO constant uses values that don\'t match database ENUM definition');
    } else {
      console.log('\n=== ALL VALUES VALID ===');
      console.log('All LOAI_HO_TRO values match database ENUM - bug is fixed!');
    }

    // CRITICAL ASSERTION: This will FAIL on unfixed code
    LOAI_HO_TRO.forEach(option => {
      expect(
        VALID_DATABASE_ENUM_VALUES,
        `LOAI_HO_TRO option "${option.label}" has invalid value "${option.value}". Expected one of: ${VALID_DATABASE_ENUM_VALUES.join(', ')}`
      ).toContain(option.value);
    });
  });

  /**
   * Property-Based Test: Verify all possible dropdown values map to valid ENUM values
   */
  it('Property 1 (PBT): All LOAI_HO_TRO values map to valid database ENUM values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LOAI_HO_TRO.map(opt => opt.value)),
        (selectedValue) => {
          // Every possible value that can be selected from the dropdown
          // MUST be a valid database ENUM value
          const isValid = VALID_DATABASE_ENUM_VALUES.includes(selectedValue);
          
          if (!isValid) {
            console.error(`\nCounterexample: "${selectedValue}" is invalid`);
            console.error(`Valid values: ${VALID_DATABASE_ENUM_VALUES.join(', ')}`);
          }
          
          return isValid;
        }
      ),
      { numRuns: 100 } // Test extensively
    );
  });

  /**
   * Specific Bug Reproduction: Check if "Trao tang" exists (the known invalid value)
   */
  it('Bug Reproduction: "Trao tang" should not exist in LOAI_HO_TRO values', () => {
    const invalidValue = 'Trao tang';
    const hasInvalidValue = LOAI_HO_TRO.some(opt => opt.value === invalidValue);
    
    if (hasInvalidValue) {
      console.error('\n=== SPECIFIC BUG CONFIRMED ===');
      console.error(`Found the known invalid value "${invalidValue}" in LOAI_HO_TRO`);
      console.error('This value causes MySQL "Data truncated" error');
      console.error('Expected: One of', VALID_DATABASE_ENUM_VALUES);
    }
    
    // This will FAIL on unfixed code (where "Trao tang" exists)
    // After fix, "Trao tang" should be replaced with valid ENUM value
    expect(hasInvalidValue).toBe(false);
  });

  /**
   * Test that LOAI_HO_TRO has exactly 3 options (matching database ENUM cardinality)
   */
  it('LOAI_HO_TRO should have exactly 3 options matching database ENUM', () => {
    console.log(`\nLOAI_HO_TRO length: ${LOAI_HO_TRO.length}`);
    console.log(`Database ENUM cardinality: ${VALID_DATABASE_ENUM_VALUES.length}`);
    
    // The database ENUM has exactly 3 values, so LOAI_HO_TRO should too
    expect(LOAI_HO_TRO).toHaveLength(VALID_DATABASE_ENUM_VALUES.length);
  });
});
