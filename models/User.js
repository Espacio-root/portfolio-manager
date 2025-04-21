import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: true 
  },
  purchasePrice: { 
    type: Number, 
    required: true 
  },
  currentPrice: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  image: String,
  portfolio: [PortfolioSchema]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
