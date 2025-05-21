# Expense Tracker with Cross-Platform Sync
for live link "https://zippy-marzipan-42ff36.netlify.app/"
This is a cross-platform expense tracker application that works on both web (React) and mobile (React Native) platforms with a synchronized backend.

## Tech Stack

- **Frontend**: React Native (Expo) with web support
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **State Management**: React Context API
- **API Communication**: Axios
- **Offline Storage**: AsyncStorage
- **UI Components**: Custom components with Reanimated for animations

## Features

- Add, view, and delete expenses
- Categorize expenses
- View expense summaries and totals
- Dark mode and theme settings
- Offline support on mobile
- Cross-platform sync
- Swipe to delete

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Expo CLI

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
Edit the `.env` file with your MongoDB connection string.

4. Start the server:
```
npm run start:server
```

5. Start the Expo app:
```
npm run dev
```

## How Offline Sync Works

The application implements a timestamp-based synchronization system:

1. **Local-First Data**: All changes are saved locally first, providing immediate feedback to users.

2. **Background Sync**: When online, the app periodically syncs with the server.

3. **Conflict Resolution**: The system uses a "last write wins" approach based on timestamps:
   - Each expense has an `updatedAt` timestamp
   - When syncing, the most recently updated version is considered the source of truth
   - Server provides the final resolution for conflicts

4. **Optimistic UI**: Changes appear immediately in the UI before server confirmation.

5. **Sync Process**:
   - Local unsynced changes are sent to the server
   - Server processes changes and returns updated data
   - Local database is updated with server response
   - Deleted items are soft-deleted with a flag rather than removed completely

## Trade-offs

- **Sync Frequency**: Set to 1 minute to balance battery usage with data freshness.
- **Conflict Resolution**: Using "last write wins" simplifies implementation but may occasionally lead to data loss in specific edge cases.
- **Soft Deletion**: Items are marked as deleted rather than removed completely to preserve history and enable future recovery features.
- **Local Storage**: Using AsyncStorage for simplicity, though SQLite would be more robust for larger datasets.

## API Endpoints

- `GET /api/expenses` - Get all expenses
- `GET /api/expenses?since=[timestamp]` - Get expenses updated since timestamp
- `POST /api/expenses` - Add a new expense
- `DELETE /api/expenses/:id` - Delete an expense (soft delete)
- `POST /api/expenses/sync` - Sync multiple expenses

## License

MIT
