const express = require('express');
require('dotenv').config(); 
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authroutes');  // route
const medicineroutes = require('./src/routes/medicineroutes');  // route
const relationshipRoutes = require('./src/routes/relationshiproute');

const cors = require('cors'); 

const app = express();

app.use(express.json()); // Parses JSON
app.use(cors()); // <-- allow requests from web

connectDB(); // connects to MongoDB

app.use('/api/auth/', authRoutes);
app.use('/api/medicine/', medicineroutes);
app.use('/api/relationship', relationshipRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
