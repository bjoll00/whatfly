# Database Documentation

This directory contains database structure, migration, and data normalization documentation.

## 📋 Files

- **[FLY_DATABASE_STRUCTURE.md](./FLY_DATABASE_STRUCTURE.md)** - Complete database schema and structure
- **[IMITATED_INSECT_NORMALIZATION.md](./IMITATED_INSECT_NORMALIZATION.md)** - Data normalization from JSONB to columns

## 🗄️ Database Structure

The app uses Supabase (PostgreSQL) with the following main tables:
- `flies` - Fly database with comprehensive attributes
- `feedback` - User feedback
- User authentication tables

## 🔄 Migrations

SQL migration files are in `scripts/migrations/`. Run them in Supabase SQL editor.

## 📊 Data Normalization

The `imitated_insect` JSONB column has been normalized into separate columns for better performance:
- `insect_category` - Fly category (Dry, Nymph, etc.)
- `insect_order` - Insect order
- `insect_behavior` - Behavior description
- `insect_size_min/max` - Size range

See [IMITATED_INSECT_NORMALIZATION.md](./IMITATED_INSECT_NORMALIZATION.md) for details.

