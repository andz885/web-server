const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/server',{useNewUrlParser: true}, (err, client) => {
      if (err) {
        return console.log('Unable to connect to MongoDB server')
      }
      console.log('Connected to MongoDB server');
      const db = client.db('server_database');


      try {
        db.collection('acc').insertOne({
            loginData: 'xvalen22-123456',
            permissions: 'admin',
            cardUID: 'F1A367C8'
          });
        }
        catch (error) {
          print(error);
        }

        client.close();
      });
