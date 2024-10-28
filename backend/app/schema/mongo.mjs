import { MongoClient } from "mongodb";

const getMongodb = async () => {
  try {
    const mongoUrl = "mongodb://localhost:27017/countrys";
    const client = await MongoClient.connect(mongoUrl);
    return client.db();
  } catch (error) {
    console.error(error);
  }
};

export { getMongodb };
