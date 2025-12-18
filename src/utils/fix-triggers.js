// fix-triggers.js - Script untuk memperbaiki trigger review_like
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixTriggers() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sako',
            multipleStatements: true
        });

        console.log('✅ Connected to database');

        // Drop existing triggers
        console.log('🔄 Dropping old triggers...');
        await connection.query('DROP TRIGGER IF EXISTS `after_review_like_insert`');
        await connection.query('DROP TRIGGER IF EXISTS `after_review_like_delete`');
        console.log('✅ Old triggers dropped');

        // Create correct INSERT trigger
        console.log('🔄 Creating new INSERT trigger...');
        const insertTrigger = `
            CREATE TRIGGER after_review_like_insert 
            AFTER INSERT ON review_like 
            FOR EACH ROW 
            BEGIN
                UPDATE review
                SET total_likes = total_likes + 1
                WHERE review_id = NEW.review_id;
            END
        `;
        await connection.query(insertTrigger);
        console.log('✅ INSERT trigger created');

        // Create correct DELETE trigger
        console.log('🔄 Creating new DELETE trigger...');
        const deleteTrigger = `
            CREATE TRIGGER after_review_like_delete 
            AFTER DELETE ON review_like 
            FOR EACH ROW 
            BEGIN
                UPDATE review 
                SET total_likes = GREATEST(total_likes - 1, 0) 
                WHERE review_id = OLD.review_id;
            END
        `;
        await connection.query(deleteTrigger);
        console.log('✅ DELETE trigger created');

        console.log('\n🎉 All triggers fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing triggers:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connection closed');
        }
    }
}

// Run the fix
fixTriggers()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
