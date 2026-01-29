const mongoose = require('mongoose');
const dotenv = require('dotenv');
const University = require('./models/University');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

// --- 50 REAL TOP UNIVERSITIES (Bilkul Asli Data) ---
const realUniversities = [
  // 🇺🇸 USA (Ivy & Top Tier)
  { name: "Massachusetts Institute of Technology (MIT)", country: "USA", ranking: 1, programs: ["CS", "Engineering", "Physics"], tuitionFees: "$57,000", acceptanceRate: "4%", location: "Cambridge, MA", category: "Dream", website: "https://web.mit.edu" },
  { name: "Stanford University", country: "USA", ranking: 3, programs: ["MBA", "CS", "Law"], tuitionFees: "$56,000", acceptanceRate: "4%", location: "Stanford, CA", category: "Dream", website: "https://stanford.edu" },
  { name: "Harvard University", country: "USA", ranking: 4, programs: ["Law", "Medicine", "Business"], tuitionFees: "$54,000", acceptanceRate: "5%", location: "Cambridge, MA", category: "Dream", website: "https://harvard.edu" },
  { name: "California Institute of Technology (Caltech)", country: "USA", ranking: 7, programs: ["Science", "Engineering"], tuitionFees: "$58,000", acceptanceRate: "3%", location: "Pasadena, CA", category: "Dream", website: "https://caltech.edu" },
  { name: "University of Chicago", country: "USA", ranking: 11, programs: ["Economics", "Sociology"], tuitionFees: "$60,000", acceptanceRate: "6%", location: "Chicago, IL", category: "Dream", website: "https://uchicago.edu" },
  { name: "University of Pennsylvania", country: "USA", ranking: 13, programs: ["Business (Wharton)", "Nursing"], tuitionFees: "$61,000", acceptanceRate: "6%", location: "Philadelphia, PA", category: "Dream", website: "https://upenn.edu" },
  { name: "Princeton University", country: "USA", ranking: 12, programs: ["Math", "Physics"], tuitionFees: "$53,000", acceptanceRate: "4%", location: "Princeton, NJ", category: "Dream", website: "https://princeton.edu" },
  { name: "Yale University", country: "USA", ranking: 14, programs: ["Law", "Arts"], tuitionFees: "$59,000", acceptanceRate: "5%", location: "New Haven, CT", category: "Dream", website: "https://yale.edu" },
  { name: "Cornell University", country: "USA", ranking: 20, programs: ["Architecture", "Engineering"], tuitionFees: "$60,000", acceptanceRate: "9%", location: "Ithaca, NY", category: "Target", website: "https://cornell.edu" },
  { name: "Columbia University", country: "USA", ranking: 22, programs: ["Journalism", "Law"], tuitionFees: "$63,000", acceptanceRate: "4%", location: "New York, NY", category: "Dream", website: "https://columbia.edu" },
  
  // 🇺🇸 USA (Public & State)
  { name: "University of Michigan-Ann Arbor", country: "USA", ranking: 25, programs: ["CS", "Business"], tuitionFees: "$52,000", acceptanceRate: "20%", location: "Ann Arbor, MI", category: "Target", website: "https://umich.edu" },
  { name: "University of California, Berkeley", country: "USA", ranking: 27, programs: ["CS", "Chemistry"], tuitionFees: "$44,000", acceptanceRate: "11%", location: "Berkeley, CA", category: "Dream", website: "https://berkeley.edu" },
  { name: "UCLA", country: "USA", ranking: 29, programs: ["Film", "Engineering"], tuitionFees: "$43,000", acceptanceRate: "11%", location: "Los Angeles, CA", category: "Target", website: "https://ucla.edu" },
  { name: "New York University (NYU)", country: "USA", ranking: 39, programs: ["Arts", "Business"], tuitionFees: "$58,000", acceptanceRate: "12%", location: "New York, NY", category: "Target", website: "https://nyu.edu" },
  { name: "University of Texas at Austin", country: "USA", ranking: 43, programs: ["Engineering", "Business"], tuitionFees: "$40,000", acceptanceRate: "32%", location: "Austin, TX", category: "Safe", website: "https://utexas.edu" },
  { name: "Georgia Tech", country: "USA", ranking: 45, programs: ["Engineering", "CS"], tuitionFees: "$31,000", acceptanceRate: "16%", location: "Atlanta, GA", category: "Target", website: "https://gatech.edu" },
  { name: "UIUC", country: "USA", ranking: 48, programs: ["CS", "Physics"], tuitionFees: "$35,000", acceptanceRate: "45%", location: "Champaign, IL", category: "Safe", website: "https://illinois.edu" },
  { name: "University of Washington", country: "USA", ranking: 50, programs: ["CS", "Medicine"], tuitionFees: "$39,000", acceptanceRate: "53%", location: "Seattle, WA", category: "Safe", website: "https://washington.edu" },
  { name: "Purdue University", country: "USA", ranking: 55, programs: ["Engineering", "Aviation"], tuitionFees: "$28,000", acceptanceRate: "69%", location: "West Lafayette, IN", category: "Safe", website: "https://purdue.edu" },
  { name: "Arizona State University", country: "USA", ranking: 156, programs: ["Data Science", "Business"], tuitionFees: "$32,000", acceptanceRate: "88%", location: "Tempe, AZ", category: "Safe", website: "https://asu.edu" },

  // 🇬🇧 UK
  { name: "University of Oxford", country: "UK", ranking: 2, programs: ["Philosophy", "Medicine"], tuitionFees: "£28,000", acceptanceRate: "17%", location: "Oxford", category: "Dream", website: "https://ox.ac.uk" },
  { name: "University of Cambridge", country: "UK", ranking: 5, programs: ["Science", "Engineering"], tuitionFees: "£29,000", acceptanceRate: "21%", location: "Cambridge", category: "Dream", website: "https://cam.ac.uk" },
  { name: "Imperial College London", country: "UK", ranking: 6, programs: ["Engineering", "Medicine"], tuitionFees: "£34,000", acceptanceRate: "14%", location: "London", category: "Dream", website: "https://imperial.ac.uk" },
  { name: "UCL", country: "UK", ranking: 8, programs: ["Architecture", "Psychology"], tuitionFees: "£26,000", acceptanceRate: "48%", location: "London", category: "Target", website: "https://ucl.ac.uk" },
  { name: "University of Edinburgh", country: "UK", ranking: 15, programs: ["AI", "Literature"], tuitionFees: "£24,000", acceptanceRate: "40%", location: "Edinburgh", category: "Target", website: "https://ed.ac.uk" },
  { name: "University of Manchester", country: "UK", ranking: 27, programs: ["Engineering", "Business"], tuitionFees: "£25,000", acceptanceRate: "56%", location: "Manchester", category: "Safe", website: "https://manchester.ac.uk" },
  { name: "King's College London", country: "UK", ranking: 35, programs: ["Law", "Health"], tuitionFees: "£27,000", acceptanceRate: "13%", location: "London", category: "Target", website: "https://kcl.ac.uk" },
  { name: "LSE", country: "UK", ranking: 45, programs: ["Economics", "Politics"], tuitionFees: "£23,000", acceptanceRate: "9%", location: "London", category: "Dream", website: "https://lse.ac.uk" },

  // 🇨🇦 Canada
  { name: "University of Toronto", country: "Canada", ranking: 21, programs: ["AI", "Psychology"], tuitionFees: "CAD 60,000", acceptanceRate: "43%", location: "Toronto", category: "Target", website: "https://utoronto.ca" },
  { name: "McGill University", country: "Canada", ranking: 30, programs: ["Medicine", "Law"], tuitionFees: "CAD 55,000", acceptanceRate: "46%", location: "Montreal", category: "Target", website: "https://mcgill.ca" },
  { name: "UBC", country: "Canada", ranking: 34, programs: ["Forestry", "Business"], tuitionFees: "CAD 45,000", acceptanceRate: "52%", location: "Vancouver", category: "Target", website: "https://ubc.ca" },
  { name: "University of Waterloo", country: "Canada", ranking: 150, programs: ["CS", "Engineering"], tuitionFees: "CAD 45,000", acceptanceRate: "53%", location: "Waterloo", category: "Target", website: "https://uwaterloo.ca" },
  { name: "University of Alberta", country: "Canada", ranking: 110, programs: ["Energy", "Health"], tuitionFees: "CAD 30,000", acceptanceRate: "58%", location: "Edmonton", category: "Safe", website: "https://ualberta.ca" },

  // 🇦🇺 Australia & Others
  { name: "University of Melbourne", country: "Australia", ranking: 33, programs: ["Medicine", "IT"], tuitionFees: "AUD 45,000", acceptanceRate: "70%", location: "Melbourne", category: "Target", website: "https://unimelb.edu.au" },
  { name: "University of Sydney", country: "Australia", ranking: 41, programs: ["Law", "Business"], tuitionFees: "AUD 48,000", acceptanceRate: "30%", location: "Sydney", category: "Target", website: "https://sydney.edu.au" },
  { name: "UNSW Sydney", country: "Australia", ranking: 45, programs: ["Engineering", "Solar Energy"], tuitionFees: "AUD 47,000", acceptanceRate: "60%", location: "Sydney", category: "Safe", website: "https://unsw.edu.au" },
  { name: "National University of Singapore", country: "Singapore", ranking: 11, programs: ["CS", "Business"], tuitionFees: "SGD 30,000", acceptanceRate: "5%", location: "Singapore", category: "Dream", website: "https://nus.edu.sg" },
  { name: "ETH Zurich", country: "Switzerland", ranking: 9, programs: ["Engineering", "Technology"], tuitionFees: "CHF 1,500", acceptanceRate: "27%", location: "Zurich", category: "Dream", website: "https://ethz.ch" }
];

// --- GENERATE 450 MORE UNIVERSITIES (Total ~500) ---
const generateMoreUniversities = () => {
  const cities = [
    "Boston", "Chicago", "Seattle", "Austin", "Berlin", "Paris", "Tokyo", "Seoul", "Dubai", "Sydney", 
    "London", "Toronto", "Vancouver", "Munich", "Barcelona", "Madrid", "Rome", "Amsterdam", "Dublin",
    "San Francisco", "Denver", "Houston", "Miami", "Atlanta", "Philadelphia", "Detroit", "Phoenix"
  ];
  
  const prefixes = ["University of", "State University of", "Institute of Technology", "College of", "National University of"];
  const suffixes = ["Science", "Arts", "Engineering", "Business", "Management", "Technology", "Medical Sciences"];
  
  const countries = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "South Korea", "Italy", "Spain", "Netherlands", "Ireland"];
  
  const generated = [];

  for (let i = 1; i <= 450; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    // Unique Name Generator
    let name;
    if (Math.random() > 0.5) {
      name = `${prefix} ${city}`;
    } else {
      name = `${city} ${suffix} Institute`;
    }

    const rank = 50 + i; // Rank 51 se shuru hoga
    const fees = Math.floor(Math.random() * (60000 - 15000) + 15000); // 15k to 60k random fees
    const acceptance = Math.floor(Math.random() * (90 - 20) + 20); // 20% to 90% random acceptance
    
    // Category Logic based on Acceptance Rate
    let cat = "Safe";
    if (acceptance < 30) cat = "Dream";
    else if (acceptance < 60) cat = "Target";

    generated.push({
      name: `${name} ${i}`, // Adding number to ensure uniqueness
      country: country,
      ranking: rank,
      programs: ["Computer Science", "Business Administration", "Data Science", "Psychology", "Mechanical Engineering"],
      tuitionFees: `$${fees.toLocaleString()}/year`,
      acceptanceRate: `${acceptance}%`,
      location: city,
      category: cat,
      website: "https://google.com/search?q=" + name.replace(/ /g, "+")
    });
  }
  return generated;
};

const seedDB = async () => {
  try {
    // 1. Purana data saaf karein
    await University.deleteMany({});
    console.log('🧹 Cleaned old database...');

    // 2. Real aur Generated data mix karein
    const allUniversities = [...realUniversities, ...generateMoreUniversities()];
    
    // 3. Insert karein
    await University.insertMany(allUniversities);
    console.log(`✅ Successfully Seeded ${allUniversities.length} Universities!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

seedDB();