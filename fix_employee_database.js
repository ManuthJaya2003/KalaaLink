const mongoose = require('./BACKEND/node_modules/mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/')
  .then(() => {
    console.log('Connected to MongoDB');
    return fixEmployeeDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });

async function fixEmployeeDatabase() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('employeemodels');
    
    console.log('Dropping existing employee_id_1 index...');
    try {
      await collection.dropIndex('employee_id_1');
      console.log('✅ Index dropped successfully');
    } catch (err) {
      console.log('Index might not exist or already dropped:', err.message);
    }
    
    console.log('Creating new sparse unique index...');
    await collection.createIndex({ employeeID: 1 }, { unique: true, sparse: true });
    console.log('✅ New sparse unique index created');
    
    console.log('Updating existing records with null employeeID...');
    const employees = await collection.find({ employeeID: null }).toArray();
    console.log(`Found ${employees.length} employees with null employeeID`);
    
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const newEmployeeID = `EMP${(i + 1).toString().padStart(3, '0')}`;
      
      await collection.updateOne(
        { _id: employee._id },
        { $set: { employeeID: newEmployeeID } }
      );
      console.log(`Updated employee ${employee._id} with employeeID: ${newEmployeeID}`);
    }
    
    console.log('✅ Database fix completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing database:', err);
    process.exit(1);
  }
}
