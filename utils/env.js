const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

export default isProduction;
