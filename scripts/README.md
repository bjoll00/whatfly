# Scripts Directory

This directory contains utility scripts organized by function.

## 📁 Directory Structure

### `/database`
Database-related scripts:
- `checkFlyDatabase.js` - Check database status
- `populateDatabase.js` - Populate fly database
- `fixFlyFields.js` - Fix missing fly fields
- `normalizeImitatedInsectData.js` - Normalize imitated_insect data
- And more...

### `/migrations`
SQL migration files:
- `migration_normalize_imitated_insect.sql` - Normalize imitated_insect columns
- `flyDatabaseMigration.sql` - Initial fly database migration
- And more...

### `/utilities`
Utility scripts:
- `testHierarchicalAlgorithm.js` - Test algorithm
- `debugWeatherTimeData.js` - Debug weather data
- `build-dev.bat` - Development build script
- `build-ios-dev.bat` - iOS development build

## 🚀 Usage

### Database Scripts
```bash
node scripts/database/checkFlyDatabase.js
node scripts/database/populateDatabase.js
```

### Migrations
Run SQL files in Supabase SQL editor.

### Utilities
```bash
node scripts/utilities/testHierarchicalAlgorithm.js
```

## ⚠️ Important

- Always backup database before running migration scripts
- Test scripts in development environment first
- Review script code before running

