import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.json');

interface Database {
  users: any[];
  communities: any[];
  community_members: any[];
  proposals: any[];
  proposal_votes: any[];
  posts: any[];
  pledges: any[];
  comments: any[];
  sessions: any[];
}

let dbCache: Database | null = null;

function ensureDbExists() {
  if (!fs.existsSync(dbPath)) {
    const initialDb: Database = {
      users: [],
      communities: [],
      community_members: [],
      proposals: [],
      proposal_votes: [],
      posts: [],
      pledges: [],
      comments: [],
      sessions: [],
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
  }
}

function readDb(): Database {
  ensureDbExists();
  if (!dbCache) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    dbCache = JSON.parse(data);
  }
  return dbCache!;
}

function writeDb(db: Database) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  dbCache = db;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mock database with prepare/run/get/all interface
export function getDb() {
  const db = readDb();

  return {
    prepare: (sql: string) => {
      return {
        run: (...params: any[]) => {
          // Parse INSERT statements
          if (sql.trim().toUpperCase().startsWith('INSERT')) {
            const tableMatch = sql.match(/INSERT INTO (\w+)/i);
            if (tableMatch) {
              const table = tableMatch[1] as keyof Database;
              const columnsMatch = sql.match(/\(([^)]+)\)/);
              if (columnsMatch) {
                const columns = columnsMatch[1].split(',').map((c) => c.trim());
                const obj: any = {};
                columns.forEach((col, i) => {
                  obj[col] = params[i];
                });
                obj.created_at = obj.created_at || new Date().toISOString();
                obj.updated_at = obj.updated_at || new Date().toISOString();
                db[table].push(obj);
                writeDb(db);
              }
            }
          }
          // Parse UPDATE statements
          else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
            const tableMatch = sql.match(/UPDATE (\w+)/i);
            if (tableMatch) {
              const table = tableMatch[1] as keyof Database;
              const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
              const whereMatch = sql.match(/WHERE\s+(.+)/i);

              if (setMatch && whereMatch) {
                const items = db[table] as any[];
                items.forEach((item) => {
                  // Simple WHERE id = ? matching
                  if (whereMatch[1].includes('id = ?') && item.id === params[params.length - 1]) {
                    // Update fields
                    const setClause = setMatch[1];
                    const assignments = setClause.split(',');
                    let paramIndex = 0;
                    assignments.forEach((assignment) => {
                      const [field] = assignment.trim().split('=');
                      item[field.trim()] = params[paramIndex++];
                    });
                    item.updated_at = new Date().toISOString();
                  }
                });
                writeDb(db);
              }
            }
          }
          // Parse DELETE statements
          else if (sql.trim().toUpperCase().startsWith('DELETE')) {
            const tableMatch = sql.match(/DELETE FROM (\w+)/i);
            if (tableMatch) {
              const table = tableMatch[1] as keyof Database;
              const whereMatch = sql.match(/WHERE\s+(.+)/i);

              if (whereMatch) {
                db[table] = (db[table] as any[]).filter((item) => {
                  // Simple WHERE id = ? matching
                  if (whereMatch[1].includes('id = ?')) {
                    return item.id !== params[0];
                  }
                  return true;
                });
                writeDb(db);
              }
            }
          }
        },
        get: (...params: any[]) => {
          // Parse SELECT statements
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            // Extract table name (simple case)
            const fromMatch = sql.match(/FROM (\w+)/i);
            if (fromMatch) {
              const table = fromMatch[1] as keyof Database;
              const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);

              let items = db[table] as any[];

              if (whereMatch) {
                const condition = whereMatch[1].trim();
                items = items.filter((item) => {
                  // Handle different WHERE conditions
                  if (condition.includes('email = ?')) {
                    return item.email === params[0];
                  }
                  if (condition.includes('id = ?')) {
                    return item.id === params[0];
                  }
                  if (condition.includes('community_id = ? AND user_id = ?')) {
                    return item.community_id === params[0] && item.user_id === params[1];
                  }
                  if (condition.includes('expires_at >')) {
                    return new Date(item.expires_at) > new Date();
                  }
                  if (condition.includes('proposal_id = ? AND user_id = ?')) {
                    return item.proposal_id === params[0] && item.user_id === params[1];
                  }
                  return true;
                });
              }

              return items[0] || null;
            }
          }
          return null;
        },
        all: (...params: any[]) => {
          // Parse SELECT statements for all results
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const fromMatch = sql.match(/FROM (\w+)/i);
            if (fromMatch) {
              const table = fromMatch[1] as keyof Database;
              const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);

              let items = [...(db[table] as any[])];

              if (whereMatch) {
                const condition = whereMatch[1].trim();
                items = items.filter((item) => {
                  if (condition.includes('community_id = ?')) {
                    return item.community_id === params[params.length - 1] || item.community_id === params[0];
                  }
                  if (condition.includes('user_id = ?')) {
                    return item.user_id === params[0];
                  }
                  if (condition.includes('post_id = ?')) {
                    return item.post_id === params[0];
                  }
                  if (condition.includes('proposal_id = ?')) {
                    return item.proposal_id === params[0];
                  }
                  if (condition.includes("status = 'active'") || condition.includes('status = ?')) {
                    const statusValue = params.find((p) => ['active', 'pending', 'funded'].includes(p));
                    return item.status === (statusValue || 'active');
                  }
                  return true;
                });
              }

              // Handle ORDER BY
              if (sql.includes('ORDER BY')) {
                const orderMatch = sql.match(/ORDER BY (\w+\.)?(\w+)\s+(ASC|DESC)?/i);
                if (orderMatch) {
                  const field = orderMatch[2];
                  const direction = orderMatch[3]?.toUpperCase() || 'ASC';
                  items.sort((a, b) => {
                    if (direction === 'DESC') {
                      return b[field] > a[field] ? 1 : -1;
                    }
                    return a[field] > b[field] ? 1 : -1;
                  });
                }
              }

              // Handle LIMIT
              if (sql.includes('LIMIT')) {
                const limitMatch = sql.match(/LIMIT (\d+)/i);
                if (limitMatch) {
                  items = items.slice(0, parseInt(limitMatch[1]));
                }
              }

              return items;
            }
          }
          return [];
        },
      };
    },
    exec: (sql: string) => {
      // Handle multi-statement DELETE queries
      const statements = sql.split(';').filter((s) => s.trim());
      statements.forEach((statement) => {
        if (statement.trim().toUpperCase().startsWith('DELETE')) {
          const tableMatch = statement.match(/DELETE FROM (\w+)/i);
          if (tableMatch) {
            const table = tableMatch[1] as keyof Database;
            db[table] = [];
          }
        }
      });
      writeDb(db);
    },
  };
}

export function closeDb() {
  // No-op for file-based storage
}
