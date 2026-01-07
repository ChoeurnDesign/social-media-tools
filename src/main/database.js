import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secret-key-change-in-production';

class DatabaseManager {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = join(userDataPath, 'tiktok-manager.db');
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    this.initializeTables();
  }

  initializeTables() {
    // Accounts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT,
        password_encrypted TEXT NOT NULL,
        nickname TEXT,
        avatar_url TEXT,
        status TEXT DEFAULT 'inactive',
        followers INTEGER DEFAULT 0,
        following INTEGER DEFAULT 0,
        posts INTEGER DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        cookies TEXT,
        user_agent TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `);

    // Automation settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS automation_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL UNIQUE,
        auto_scroll BOOLEAN DEFAULT 0,
        scroll_speed INTEGER DEFAULT 100,
        auto_like BOOLEAN DEFAULT 0,
        like_probability REAL DEFAULT 0.3,
        auto_follow BOOLEAN DEFAULT 0,
        follow_daily_limit INTEGER DEFAULT 100,
        auto_comment BOOLEAN DEFAULT 0,
        comment_probability REAL DEFAULT 0.2,
        comment_templates TEXT,
        preset TEXT DEFAULT 'organic',
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `);

    // Activity logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `);

    // Groups table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES groups(id)
      )
    `);

    // Account groups mapping
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS account_groups (
        account_id INTEGER,
        group_id INTEGER,
        PRIMARY KEY (account_id, group_id),
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      )
    `);

    // Tags table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT
      )
    `);

    // Account tags mapping
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS account_tags (
        account_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (account_id, tag_id),
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Proxies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS proxies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocol TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        username TEXT,
        password TEXT,
        location TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Account proxies mapping
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS account_proxies (
        account_id INTEGER PRIMARY KEY,
        proxy_id INTEGER,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (proxy_id) REFERENCES proxies(id) ON DELETE SET NULL
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
      CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_account ON activity_logs(account_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
    `);
  }

  // Encryption helpers
  encrypt(text) {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  decrypt(ciphertext) {
    if (!ciphertext) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  }

  // Account methods
  addAccount({ username, email, password, nickname }) {
    const stmt = this.db.prepare(`
      INSERT INTO accounts (username, email, password_encrypted, nickname)
      VALUES (?, ?, ?, ?)
    `);
    
    // Password is optional - use empty string if not provided
    const encryptedPassword = password ? this.encrypt(password) : this.encrypt('');
    
    const result = stmt.run(
      username,
      email || null,
      encryptedPassword,
      nickname || null
    );

    // Create default automation settings
    const automationStmt = this.db.prepare(`
      INSERT INTO automation_settings (account_id)
      VALUES (?)
    `);
    automationStmt.run(result.lastInsertRowid);

    return this.getAccountById(result.lastInsertRowid);
  }

  getAccounts() {
    const stmt = this.db.prepare(`
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT t.name) as tags,
        GROUP_CONCAT(DISTINCT g.name) as groups
      FROM accounts a
      LEFT JOIN account_tags at ON a.id = at.account_id
      LEFT JOIN tags t ON at.tag_id = t.id
      LEFT JOIN account_groups ag ON a.id = ag.account_id
      LEFT JOIN groups g ON ag.group_id = g.id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    
    const accounts = stmt.all();
    
    return accounts.map(account => ({
      ...account,
      password: this.decrypt(account.password_encrypted),
      tags: account.tags ? account.tags.split(',') : [],
      groups: account.groups ? account.groups.split(',') : []
    }));
  }

  getAccountById(id) {
    const stmt = this.db.prepare(`
      SELECT * FROM accounts WHERE id = ?
    `);
    
    const account = stmt.get(id);
    if (!account) return null;
    
    return {
      ...account,
      password: this.decrypt(account.password_encrypted)
    };
  }

  updateAccount(id, { username, email, password, nickname, status, followers, following, posts, total_views }) {
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password !== undefined && password !== '') {
      updates.push('password_encrypted = ?');
      values.push(this.encrypt(password));
    }
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (followers !== undefined) {
      updates.push('followers = ?');
      values.push(followers);
    }
    if (following !== undefined) {
      updates.push('following = ?');
      values.push(following);
    }
    if (posts !== undefined) {
      updates.push('posts = ?');
      values.push(posts);
    }
    if (total_views !== undefined) {
      updates.push('total_views = ?');
      values.push(total_views);
    }

    if (updates.length === 0) return this.getAccountById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE accounts 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.getAccountById(id);
  }

  deleteAccount(id) {
    const stmt = this.db.prepare('DELETE FROM accounts WHERE id = ?');
    stmt.run(id);
  }

  updateLastLogin(accountId) {
    const stmt = this.db.prepare(`
      UPDATE accounts 
      SET last_login = CURRENT_TIMESTAMP, status = 'active'
      WHERE id = ?
    `);
    stmt.run(accountId);
  }

  // Automation settings methods
  getAutomationSettings(accountId) {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_settings WHERE account_id = ?
    `);
    
    const settings = stmt.get(accountId);
    if (!settings) return null;
    
    return {
      ...settings,
      comment_templates: settings.comment_templates ? JSON.parse(settings.comment_templates) : []
    };
  }

  updateAutomationSettings(accountId, settings) {
    const updates = [];
    const values = [];

    Object.keys(settings).forEach(key => {
      if (key === 'comment_templates') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(settings[key]));
      } else {
        updates.push(`${key} = ?`);
        values.push(settings[key]);
      }
    });

    if (updates.length === 0) return;

    values.push(accountId);

    const stmt = this.db.prepare(`
      UPDATE automation_settings 
      SET ${updates.join(', ')}
      WHERE account_id = ?
    `);
    
    stmt.run(...values);
  }

  // Activity log methods
  logActivity(accountId, actionType, details = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO activity_logs (account_id, action_type, details)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(accountId, actionType, JSON.stringify(details));
  }

  getActivityLogs(accountId = null, limit = 100) {
    let stmt;
    if (accountId) {
      stmt = this.db.prepare(`
        SELECT * FROM activity_logs 
        WHERE account_id = ?
        ORDER BY created_at DESC 
        LIMIT ?
      `);
      return stmt.all(accountId, limit);
    } else {
      stmt = this.db.prepare(`
        SELECT al.*, a.username 
        FROM activity_logs al
        JOIN accounts a ON al.account_id = a.id
        ORDER BY al.created_at DESC 
        LIMIT ?
      `);
      return stmt.all(limit);
    }
  }

  // Group methods
  addGroup(name, color = null, parentId = null) {
    const stmt = this.db.prepare(`
      INSERT INTO groups (name, color, parent_id)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(name, color, parentId);
    return { id: result.lastInsertRowid, name, color, parent_id: parentId };
  }

  getGroups() {
    const stmt = this.db.prepare('SELECT * FROM groups ORDER BY name');
    return stmt.all();
  }

  assignAccountToGroup(accountId, groupId) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO account_groups (account_id, group_id)
      VALUES (?, ?)
    `);
    stmt.run(accountId, groupId);
  }

  removeAccountFromGroup(accountId, groupId) {
    const stmt = this.db.prepare(`
      DELETE FROM account_groups 
      WHERE account_id = ? AND group_id = ?
    `);
    stmt.run(accountId, groupId);
  }

  // Tag methods
  addTag(name, color = null) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO tags (name, color)
      VALUES (?, ?)
    `);
    
    stmt.run(name, color);
    return this.getTagByName(name);
  }

  getTags() {
    const stmt = this.db.prepare('SELECT * FROM tags ORDER BY name');
    return stmt.all();
  }

  getTagByName(name) {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE name = ?');
    return stmt.get(name);
  }

  assignTagToAccount(accountId, tagId) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO account_tags (account_id, tag_id)
      VALUES (?, ?)
    `);
    stmt.run(accountId, tagId);
  }

  removeTagFromAccount(accountId, tagId) {
    const stmt = this.db.prepare(`
      DELETE FROM account_tags 
      WHERE account_id = ? AND tag_id = ?
    `);
    stmt.run(accountId, tagId);
  }

  // Proxy methods
  addProxy({ protocol, host, port, username = null, password = null, location = null }) {
    const stmt = this.db.prepare(`
      INSERT INTO proxies (protocol, host, port, username, password, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(protocol, host, port, username, password, location);
    return { id: result.lastInsertRowid, protocol, host, port, username, location };
  }

  getProxies() {
    const stmt = this.db.prepare('SELECT * FROM proxies WHERE is_active = 1');
    return stmt.all();
  }

  assignProxyToAccount(accountId, proxyId) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO account_proxies (account_id, proxy_id)
      VALUES (?, ?)
    `);
    stmt.run(accountId, proxyId);
  }

  getProxyForAccount(accountId) {
    const stmt = this.db.prepare(`
      SELECT p.* FROM proxies p
      JOIN account_proxies ap ON p.id = ap.proxy_id
      WHERE ap.account_id = ?
    `);
    return stmt.get(accountId);
  }

  // Statistics methods
  getStatistics() {
    const totalAccounts = this.db.prepare('SELECT COUNT(*) as count FROM accounts').get().count;
    const activeAccounts = this.db.prepare('SELECT COUNT(*) as count FROM accounts WHERE status = "active"').get().count;
    const totalFollowers = this.db.prepare('SELECT SUM(followers) as sum FROM accounts').get().sum || 0;
    const totalPosts = this.db.prepare('SELECT SUM(posts) as sum FROM accounts').get().sum || 0;
    const totalViews = this.db.prepare('SELECT SUM(total_views) as sum FROM accounts').get().sum || 0;

    return {
      totalAccounts,
      activeAccounts,
      totalFollowers,
      totalPosts,
      totalViews,
      activePercentage: totalAccounts > 0 ? Math.round((activeAccounts / totalAccounts) * 100) : 0
    };
  }

  close() {
    this.db.close();
  }
}

export default DatabaseManager;
