# Final Bug Report

| Bug ID | Module | Description | Steps to Reproduce | Severity | Status |
|---|---|---|---|---|---|
| BUG-01 | UI | Detail page layout breaks on 375px screens | 1. Open Detail Page 2. Resize to 375px | Medium | Fixed |
| BUG-02 | Backend | SQLite locked error during concurrent inserts | 1. Run seed script 2. Try to add via UI concurrently | Low | Fixed |
| BUG-03 | API | Unhandled promise rejection on missing ID | 1. Send GET /api/products/invalid_id | High | Fixed |
| BUG-04 | UI | No empty state when dashboard is empty | 1. Delete all products 2. View dashboard | Minor | Fixed |
