import express, { Request, Response } from 'express';
import cors from 'cors';
import connection from './Config/database.config.js';
import authRoute from './Routes/auth.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoute);

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Welcome to the API!' });
});

connection();
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
