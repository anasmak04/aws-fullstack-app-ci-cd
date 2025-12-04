const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const todosRoutes = require('./routes/todoRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/todos', todosRoutes);

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));