# Database Schema Implementation Guide (Updated)

## Current Issue

The error you're encountering (`Unknown column 'ead.recording_id' in 'on clause'`) indicates a discrepancy between the schema definition and the code that's accessing it. The query is trying to join `eeg_recordings` with `eeg_analysis_details` using a column named `recording_id`, but in your schema the column is called `eeg_record_id`.

Additionally, the terminology in the database didn't match what was displayed in the UI - the backend used "doctors" and "staff" while the frontend displayed "consultants" and "jr. doctors". We've fixed both issues.

## Solution 

I've created a revised schema file (`revised_database_schema.sql`) that provides a consolidated database structure with:

1. Direct use of "consultant" and "junior_doctor" terminology in the database
2. Proper storage of patient biographical details
3. Consistent naming conventions and relationships
4. Comprehensive tables for all system functionality

### Implementation Steps

1. **Backup your current database** (important before any schema changes):
   ```
   mysqldump -u root -p neuroassist > neuroassist_backup.sql
   ```

2. **Run the updated schema script**:
   ```
   mysql -u root -p < revised_database_schema.sql
   ```

3. **Restart your server** after schema changes:
   ```
   npm run server
   ```

## Key Schema Changes

1. **Consistent Terminology Throughout**:
   - Changed database table names to directly use `consultants` instead of `doctors`
   - Changed database table names to directly use `junior_doctors` instead of `staff`
   - Updated user type enum to use `'patient', 'consultant', 'junior_doctor'`
   
2. **Patient Information Structure**:
   - `users` table: Stores authentication info plus `full_name` and `email`
   - `patients` table: Stores all biographical details including `date_of_birth`, `gender`, `contact_number`, etc.
   - Each patient has a 1:1 relationship between these tables via `user_id`
   
3. **Relationship Tables**:
   - `patient_consultant_relationships` for tracking patient-consultant associations
   - All other tables use explicit references to link records
   
4. **EEG Data Structure**:
   - `eeg_recordings` - Raw EEG recording files
   - `eeg_analysis_details` - Analysis information with proper foreign keys
   - `analysis_results` - Results linked properly to recordings

## Complete Data Model

```
users
│
├── patients
│   ├── patient_medical_records
│   ├── patient_vitals
│   └── eeg_recordings
│       ├── analysis_results
│       │   └── conceptual_sensitivities
│       └── eeg_analysis_details
│
├── consultants
│   └── patient_consultant_relationships
│
└── junior_doctors
```

## Patient Information Details

Patient information is stored across two tables:

1. **users table** - Authentication and basic info:
   - id, username, password_hash, email, full_name, user_type

2. **patients table** - Detailed biographical info:
   - id, user_id (links to users table), patient_id, date_of_birth, gender
   - contact_number, address, medical_history
   - created_at, updated_at

This design separates authentication concerns from medical/biographical information while allowing easy access to all patient details.

## Troubleshooting

If you continue to experience issues:

1. Check the console output for detailed error messages
2. Verify that your MySQL connection settings are correct
3. Make sure all foreign key relationships are properly defined
4. Confirm that queries are using the correct column and table names from the schema

This updated schema ensures that all data is fetched dynamically from the database with consistent terminology throughout the system. 