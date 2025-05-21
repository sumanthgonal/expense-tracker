const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Parser } = require('json2csv');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expensetracker';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Expense Schema
const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'health', 'travel', 'education', 'other']
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Create index for faster queries
expenseSchema.index({ updatedAt: 1 });
expenseSchema.index({ deleted: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

// API Routes
app.get('/api/expenses', async (req, res) => {
  try {
    const { since } = req.query;
    let query = { deleted: { $ne: true } };
    
    if (since) {
      query.updatedAt = { $gt: new Date(since) };
    }
    
    const expenses = await Expense.find(query).sort({ updatedAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    const newExpense = new Expense({
      amount,
      category,
      description,
      date: new Date(date)
    });
    
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        amount,
        category,
        description,
        date: new Date(date)
      },
      { new: true }
    );
    
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Expense.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

app.get('/api/expenses/export', async (req, res) => {
  try {
    const expenses = await Expense.find({ deleted: { $ne: true } })
      .sort({ date: -1 });
    
    const fields = ['date', 'description', 'category', 'amount'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(expenses);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({ error: 'Failed to export expenses' });
  }
});

// Sync endpoint for mobile clients
app.post('/api/expenses/sync', async (req, res) => {
  try {
    const { expenses } = req.body;
    
    const synced = [];
    
    for (const clientExpense of expenses) {
      if (!clientExpense._id) {
        const newExpense = new Expense({
          amount: clientExpense.amount,
          category: clientExpense.category,
          description: clientExpense.description,
          date: new Date(clientExpense.date),
          deleted: clientExpense.deleted || false
        });
        
        const saved = await newExpense.save();
        synced.push(saved);
      } else {
        const existing = await Expense.findById(clientExpense._id);
        
        if (!existing) {
          const newExpense = new Expense({
            _id: clientExpense._id,
            amount: clientExpense.amount,
            category: clientExpense.category,
            description: clientExpense.description,
            date: new Date(clientExpense.date),
            deleted: clientExpense.deleted || false
          });
          
          const saved = await newExpense.save();
          synced.push(saved);
        } else {
          const clientUpdated = new Date(clientExpense.updatedAt).getTime();
          const serverUpdated = existing.updatedAt.getTime();
          
          if (clientUpdated > serverUpdated) {
            existing.amount = clientExpense.amount;
            existing.category = clientExpense.category;
            existing.description = clientExpense.description;
            existing.date = new Date(clientExpense.date);
            existing.deleted = clientExpense.deleted || false;
            
            const updated = await existing.save();
            synced.push(updated);
          } else {
            synced.push(existing);
          }
        }
      }
    }
    
    const allExpenses = await Expense.find({ deleted: { $ne: true } });
    res.json(allExpenses);
  } catch (error) {
    console.error('Error syncing expenses:', error);
    res.status(500).json({ error: 'Failed to sync expenses' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});