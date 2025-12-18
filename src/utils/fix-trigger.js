const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTrigger() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sako',
        multipleStatements: true
    });

    try {
        console.log('🔧 Fixing trigger after_review_insert_update_rating...');
        
        // Drop existing trigger
        await connection.query('DROP TRIGGER IF EXISTS after_review_insert_update_rating');
        console.log('✅ Old trigger dropped');
        
        // Create new trigger with correct column name
        const createTrigger = `
            CREATE TRIGGER after_review_insert_update_rating 
            AFTER INSERT ON review 
            FOR EACH ROW 
            BEGIN
                UPDATE tourist_place
                SET average_rating = (
                    SELECT IFNULL(AVG(rating), 0) 
                    FROM review 
                    WHERE tourist_place_id = NEW.tourist_place_id
                )
                WHERE tourist_place_id = NEW.tourist_place_id;
            END
        `;
        
        await connection.query(createTrigger);
        console.log('✅ New trigger created successfully!');
        console.log('✅ Trigger now uses correct column: tourist_place_id (not id)');
        
    } catch (error) {
        console.error('❌ Error fixing trigger:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

fixTrigger();
