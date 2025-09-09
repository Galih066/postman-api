import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connection from './Config/database.config.js';
import authRoute from './Routes/auth.route.js';
import expansesRoute from './Routes/expanses.route.js';

const app = express();
const PORT = process.env.PORT || 3000;
const cortOptions = { origin: '*' };

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(cortOptions));
app.use('/api/auth', authRoute);
app.use('/api/expanses', expansesRoute);

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Welcome to the API!' });
});

connection();
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
