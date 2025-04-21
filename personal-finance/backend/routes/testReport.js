const mongoose = require('mongoose');
   mongoose.connect('mongodb://localhost:27017/personal_finance', { useNewUrlParser: true, useUnifiedTopology: true });
   const { generateReport } = require('./cron/updateReport');

   (async () => {
     try {
       await generateReport('67ff639bf8501f8a8b339fac', 4, 2025);
       console.log('Report created successfully');
     } catch (error) {
       console.error('Error:', error);
     } finally {
       mongoose.connection.close();
     }
   })();