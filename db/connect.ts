import mongoose, { ConnectOptions } from 'mongoose';

const connectDB = (url: string): Promise<typeof mongoose> => {
  const options: ConnectOptions = {
    
    
    
    
  };

  return mongoose.connect(url, options);
};

export default connectDB;
