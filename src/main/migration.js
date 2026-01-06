import SecureStorage from './storage.js';
import DatabaseManager from './database.js';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

/**
 * Migration script to move data from JSON (electron-store) to SQLite
 * This should be run once when upgrading to the new version
 */
class Migration {
  constructor() {
    this.oldStorage = new SecureStorage();
    this.db = new DatabaseManager();
    this.migrationLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.migrationLog.push(logMessage);
  }

  async migrate() {
    this.log('Starting migration from JSON to SQLite...');

    try {
      // Check if migration has already been done
      if (this.db.db.prepare('SELECT COUNT(*) as count FROM accounts').get().count > 0) {
        this.log('Database already has accounts. Skipping migration.');
        return { success: true, message: 'Migration already completed' };
      }

      // Get old accounts from electron-store
      const oldAccounts = this.oldStorage.getAccounts();
      this.log(`Found ${oldAccounts.length} accounts to migrate`);

      if (oldAccounts.length === 0) {
        this.log('No accounts to migrate');
        return { success: true, message: 'No accounts to migrate' };
      }

      let successCount = 0;
      let errorCount = 0;

      // Migrate each account
      for (const oldAccount of oldAccounts) {
        try {
          this.log(`Migrating account: ${oldAccount.username}`);

          // Add account to new database
          const newAccount = this.db.addAccount({
            username: oldAccount.username,
            email: oldAccount.email || null,
            password: oldAccount.password || '',
            nickname: oldAccount.nickname || null
          });

          // Update created_at if available
          if (oldAccount.addedDate) {
            this.db.db.prepare(`
              UPDATE accounts 
              SET created_at = ? 
              WHERE id = ?
            `).run(oldAccount.addedDate, newAccount.id);
          }

          // Migrate cookies if they exist
          const cookies = this.oldStorage.getCookies(oldAccount.id);
          if (cookies && cookies.length > 0) {
            this.log(`  Migrating ${cookies.length} cookies for ${oldAccount.username}`);
            
            this.db.db.prepare(`
              INSERT INTO sessions (account_id, cookies, created_at)
              VALUES (?, ?, CURRENT_TIMESTAMP)
            `).run(newAccount.id, JSON.stringify(cookies));
          }

          successCount++;
          this.log(`  ✓ Successfully migrated ${oldAccount.username}`);
        } catch (error) {
          errorCount++;
          this.log(`  ✗ Error migrating ${oldAccount.username}: ${error.message}`);
        }
      }

      // Backup old data
      await this.backupOldData();

      this.log(`Migration completed: ${successCount} successful, ${errorCount} errors`);
      
      // Save migration log
      await this.saveMigrationLog();

      return {
        success: true,
        message: `Migration completed successfully`,
        stats: {
          total: oldAccounts.length,
          success: successCount,
          errors: errorCount
        }
      };

    } catch (error) {
      this.log(`Migration failed: ${error.message}`);
      console.error('Migration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async backupOldData() {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');
      
      if (fs.existsSync(configPath)) {
        const backupPath = path.join(userDataPath, `config.json.backup.${Date.now()}`);
        fs.copyFileSync(configPath, backupPath);
        this.log(`Backed up old data to: ${backupPath}`);
      }
    } catch (error) {
      this.log(`Warning: Could not backup old data: ${error.message}`);
    }
  }

  async saveMigrationLog() {
    try {
      const userDataPath = app.getPath('userData');
      const logPath = path.join(userDataPath, `migration-${Date.now()}.log`);
      fs.writeFileSync(logPath, this.migrationLog.join('\n'));
      this.log(`Migration log saved to: ${logPath}`);
    } catch (error) {
      console.error('Could not save migration log:', error);
    }
  }

  async rollback() {
    this.log('Rolling back migration...');
    
    try {
      // Clear all tables
      this.db.db.exec(`
        DELETE FROM account_proxies;
        DELETE FROM account_tags;
        DELETE FROM account_groups;
        DELETE FROM activity_logs;
        DELETE FROM automation_settings;
        DELETE FROM sessions;
        DELETE FROM accounts;
        DELETE FROM proxies;
        DELETE FROM tags;
        DELETE FROM groups;
      `);
      
      this.log('Rollback completed successfully');
      return { success: true };
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

export default Migration;
