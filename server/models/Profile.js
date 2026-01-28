const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Academic Background
  currentEducationLevel: {
    type: String,
    enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Other'],
    required: true
  },
  degree: String,
  major: String,
  graduationYear: Number,
  gpa: Number,
  
  // Study Goals
  intendedDegree: {
    type: String,
    enum: ['Bachelor', 'Master', 'MBA', 'PhD'],
    required: true
  },
  fieldOfStudy: String,
  targetIntakeYear: Number,
  preferredCountries: [String],
  
  // Budget
  budgetPerYear: {
    min: Number,
    max: Number
  },
  fundingPlan: {
    type: String,
    enum: ['Self-funded', 'Scholarship', 'Loan', 'Mixed']
  },
  
  // Exams & Readiness
  ielts: {
    status: {
      type: String,
      enum: ['Not Started', 'Preparing', 'Scheduled', 'Completed']
    },
    score: Number
  },
  toefl: {
    status: {
      type: String,
      enum: ['Not Started', 'Preparing', 'Scheduled', 'Completed']
    },
    score: Number
  },
  gre: {
    status: {
      type: String,
      enum: ['Not Started', 'Preparing', 'Scheduled', 'Completed']
    },
    score: Number
  },
  gmat: {
    status: {
      type: String,
      enum: ['Not Started', 'Preparing', 'Scheduled', 'Completed']
    },
    score: Number
  },
  sopStatus: {
    type: String,
    enum: ['Not Started', 'Draft', 'Ready'],
    default: 'Not Started'
  },
  
  // Profile Strength (Auto-calculated)
  profileStrength: {
    academics: {
      type: String,
      enum: ['Weak', 'Average', 'Strong'],
      default: 'Average'
    },
    exams: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started'
    },
    documents: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Ready'],
      default: 'Not Started'
    }
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-calculate profile strength
profileSchema.methods.calculateStrength = function() {
  // Academics
  if (this.gpa >= 3.5) this.profileStrength.academics = 'Strong';
  else if (this.gpa >= 3.0) this.profileStrength.academics = 'Average';
  else this.profileStrength.academics = 'Weak';
  
  // Exams
  const exams = [this.ielts, this.toefl, this.gre, this.gmat];
  const completedExams = exams.filter(e => e.status === 'Completed').length;
  if (completedExams >= 2) this.profileStrength.exams = 'Completed';
  else if (completedExams >= 1) this.profileStrength.exams = 'In Progress';
  else this.profileStrength.exams = 'Not Started';
  
  // Documents
  if (this.sopStatus === 'Ready') this.profileStrength.documents = 'Ready';
  else if (this.sopStatus === 'Draft') this.profileStrength.documents = 'In Progress';
  else this.profileStrength.documents = 'Not Started';
};

module.exports = mongoose.model('Profile', profileSchema);