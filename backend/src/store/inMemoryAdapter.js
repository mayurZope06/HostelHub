import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate MongoDB-compatible 24-char hex ObjectId
export const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
};

// In-Memory store
class DatabaseStore {
  constructor() {
    this.data = {
      users: [],
      students: [],
      rooms: [],
      allocations: [],
      fees: [],
      complaints: [],
      notices: [],
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('⚠️ Could not load persisted data file, starting with fresh in-memory database:', e.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('⚠️ Failed to save database to disk:', e.message);
    }
  }
}

export const dbStore = new DatabaseStore();

// Deep clone helper for plain objects, avoiding circular toJSON loops
const clone = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const plain = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val !== 'function') {
      if (val && typeof val === 'object') {
        plain[key] = Array.isArray(val)
          ? val.map((item) => (typeof item === 'object' && item !== null ? clone(item) : item))
          : clone(val);
      } else {
        plain[key] = val;
      }
    }
  }
  return plain;
};

// Match query evaluator
function matchesQuery(doc, query = {}) {
  if (!query || Object.keys(query).length === 0) return true;

  if (query.$or && Array.isArray(query.$or)) {
    const orMatches = query.$or.some((subQuery) => matchesQuery(doc, subQuery));
    if (!orMatches) return false;
  }

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or') continue;

    const docVal = doc[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.$regex !== undefined) {
        const regex = new RegExp(value.$regex, value.$options || '');
        if (!regex.test(String(docVal || ''))) return false;
        continue;
      }
      if (value.$ne !== undefined) {
        if (value.$ne === null) {
          if (docVal === null || docVal === undefined) return false;
        } else if (String(docVal) === String(value.$ne)) {
          return false;
        }
        continue;
      }
      if (value.$in !== undefined && Array.isArray(value.$in)) {
        const strList = value.$in.map(String);
        if (!strList.includes(String(docVal))) return false;
        continue;
      }
    }

    if (value === null) {
      if (docVal !== null && docVal !== undefined) return false;
    } else if (String(docVal) !== String(value)) {
      return false;
    }
  }

  return true;
}

// Chainable Query Builder
class QueryBuilder {
  constructor(collectionName, query = {}, isSingle = false) {
    this.collectionName = collectionName;
    this.query = query;
    this.isSingle = isSingle;
    this.populates = [];
    this.sortOption = null;
    this.skipCount = 0;
    this.limitCount = null;
    this.selectOption = null;
  }

  populate(pathOrObj, selectFields = null) {
    if (typeof pathOrObj === 'string') {
      this.populates.push({ path: pathOrObj, select: selectFields });
    } else if (pathOrObj && typeof pathOrObj === 'object') {
      this.populates.push(pathOrObj);
    }
    return this;
  }

  sort(option) {
    this.sortOption = option;
    return this;
  }

  skip(count) {
    this.skipCount = count || 0;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  select(fields) {
    this.selectOption = fields;
    return this;
  }

  _execute() {
    const list = dbStore.data[this.collectionName] || [];
    let results = list.filter((item) => matchesQuery(item, this.query));

    // Sorting
    if (this.sortOption) {
      results.sort((a, b) => {
        if (typeof this.sortOption === 'string') {
          const isDesc = this.sortOption.startsWith('-');
          const field = isDesc ? this.sortOption.slice(1) : this.sortOption;
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        } else if (typeof this.sortOption === 'object') {
          for (const [f, dir] of Object.entries(this.sortOption)) {
            const valA = a[f] ?? '';
            const valB = b[f] ?? '';
            if (valA < valB) return dir === -1 ? 1 : -1;
            if (valA > valB) return dir === -1 ? -1 : 1;
          }
        }
        return 0;
      });
    }

    if (this.isSingle) {
      if (results.length === 0) return null;
      let doc = clone(results[0]);
      doc = this._applyPopulate(doc);
      return this._wrapDocument(doc);
    }

    if (this.skipCount > 0) {
      results = results.slice(this.skipCount);
    }
    if (this.limitCount !== null && this.limitCount !== undefined) {
      results = results.slice(0, this.limitCount);
    }

    return results.map((item) => {
      let doc = clone(item);
      doc = this._applyPopulate(doc);
      return this._wrapDocument(doc);
    });
  }

  _applyPopulate(doc) {
    for (const pop of this.populates) {
      const field = pop.path;
      const refId = doc[field];
      if (!refId) continue;

      let targetCollection = null;
      if (field === 'student' || field === 'studentId') targetCollection = 'students';
      else if (field === 'room' || field === 'currentRoom') targetCollection = 'rooms';
      else if (field === 'allocatedBy' || field === 'userAccount') targetCollection = 'users';

      if (targetCollection && dbStore.data[targetCollection]) {
        const found = dbStore.data[targetCollection].find((x) => String(x._id) === String(refId._id || refId));
        if (found) {
          let populatedItem = clone(found);
          if (pop.select) {
            const allowed = pop.select.split(' ').filter(Boolean);
            const filtered = { _id: populatedItem._id };
            allowed.forEach((f) => {
              if (populatedItem[f] !== undefined) filtered[f] = populatedItem[f];
            });
            doc[field] = filtered;
          } else {
            doc[field] = populatedItem;
          }
        }
      }
    }
    return doc;
  }

  _wrapDocument(doc) {
    if (!doc) return null;
    const collectionName = this.collectionName;

    // Attach document methods
    doc.save = async function () {
      const list = dbStore.data[collectionName];
      const idx = list.findIndex((x) => String(x._id) === String(this._id));
      this.updatedAt = new Date().toISOString();
      if (idx !== -1) {
        list[idx] = clone(this);
      } else {
        list.push(clone(this));
      }
      dbStore.save();
      return this;
    };

    doc.toObject = function (options) {
      const obj = clone(this);
      if (options?.virtuals !== false) {
        if (collectionName === 'rooms') {
          obj.availableBeds = Math.max(0, (obj.capacity || 0) - (obj.occupiedBeds || 0));
        }
        if (collectionName === 'students') {
          obj.fullName = `${obj.firstName || ''} ${obj.lastName || ''}`.trim();
        }
        if (collectionName === 'fees') {
          obj.remainingBalance = Math.max(0, (obj.amount || 0) - (obj.paidAmount || 0));
        }
      }
      return obj;
    };

    doc.toJSON = function () {
      return this.toObject({ virtuals: true });
    };

    if (collectionName === 'users') {
      doc.comparePassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      };
    }

    if (collectionName === 'rooms') {
      doc.availableBeds = Math.max(0, (doc.capacity || 0) - (doc.occupiedBeds || 0));
    }

    if (collectionName === 'students') {
      doc.fullName = `${doc.firstName} ${doc.lastName}`.trim();
    }

    if (collectionName === 'fees') {
      doc.remainingBalance = Math.max(0, (doc.amount || 0) - (doc.paidAmount || 0));
    }

    return doc;
  }

  // Promise interface for await
  then(resolve, reject) {
    try {
      const result = this._execute();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  }
}

// Model Emulator Class
export class InMemoryModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  find(query = {}) {
    return new QueryBuilder(this.collectionName, query, false);
  }

  findOne(query = {}) {
    return new QueryBuilder(this.collectionName, query, true);
  }

  findById(id) {
    return new QueryBuilder(this.collectionName, { _id: String(id) }, true);
  }

  async countDocuments(query = {}) {
    const list = dbStore.data[this.collectionName] || [];
    return list.filter((item) => matchesQuery(item, query)).length;
  }

  async create(docData) {
    const now = new Date().toISOString();
    const cleanData = clone(docData);
    const doc = {
      _id: generateId(),
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    };

    if (this.collectionName === 'users' && doc.password && !doc.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(doc.password, salt);
    }

    dbStore.data[this.collectionName].push(doc);
    dbStore.save();

    const builder = new QueryBuilder(this.collectionName);
    return builder._wrapDocument(clone(doc));
  }

  async insertMany(docs) {
    const now = new Date().toISOString();
    const created = [];
    for (const d of docs) {
      const cleanData = clone(d);
      const doc = {
        _id: generateId(),
        ...cleanData,
        createdAt: now,
        updatedAt: now,
      };
      if (this.collectionName === 'users' && doc.password && !doc.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(doc.password, salt);
      }
      dbStore.data[this.collectionName].push(doc);
      created.push(doc);
    }
    dbStore.save();
    const builder = new QueryBuilder(this.collectionName);
    return created.map((c) => builder._wrapDocument(clone(c)));
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = dbStore.data[this.collectionName];
    const idx = list.findIndex((x) => String(x._id) === String(id));
    if (idx === -1) return null;

    const existing = list[idx];
    const updated = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };

    list[idx] = updated;
    dbStore.save();

    const builder = new QueryBuilder(this.collectionName);
    return builder._wrapDocument(clone(updated));
  }

  async findByIdAndDelete(id) {
    const list = dbStore.data[this.collectionName];
    const idx = list.findIndex((x) => String(x._id) === String(id));
    if (idx === -1) return null;

    const removed = list.splice(idx, 1)[0];
    dbStore.save();

    const builder = new QueryBuilder(this.collectionName);
    return builder._wrapDocument(clone(removed));
  }

  async updateMany(query, update) {
    const list = dbStore.data[this.collectionName];
    let count = 0;
    list.forEach((doc, idx) => {
      if (matchesQuery(doc, query)) {
        list[idx] = { ...doc, ...update, updatedAt: new Date().toISOString() };
        count++;
      }
    });
    dbStore.save();
    return { modifiedCount: count };
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      const count = dbStore.data[this.collectionName].length;
      dbStore.data[this.collectionName] = [];
      dbStore.save();
      return { deletedCount: count };
    }
    const list = dbStore.data[this.collectionName];
    const kept = list.filter((item) => !matchesQuery(item, query));
    const deletedCount = list.length - kept.length;
    dbStore.data[this.collectionName] = kept;
    dbStore.save();
    return { deletedCount };
  }
}

// In-Memory Model Singletons
export const MemoryUser = new InMemoryModel('users');
export const MemoryStudent = new InMemoryModel('students');
export const MemoryRoom = new InMemoryModel('rooms');
export const MemoryAllocation = new InMemoryModel('allocations');
export const MemoryFee = new InMemoryModel('fees');
export const MemoryComplaint = new InMemoryModel('complaints');
export const MemoryNotice = new InMemoryModel('notices');
