/**
 * Supabase-compatible client → Laravel MySQL API.
 * Keeps existing pages working without rewriting every query.
 */
import { apiFetch, ensureCsrf } from './apiClient';

const authListeners = new Set();
let cachedSession = null;

function emitAuth(event, session) {
  cachedSession = session;
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error(e);
    }
  });
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orFilters = null;
    this.orderCol = null;
    this.orderAsc = true;
    this.limitN = null;
    this.offsetN = 0;
    this.headOnly = false;
    this.countExact = false;
    this.wantSingle = false;
    this.wantMaybeSingle = false;
    this.mutation = null;
    this.mutationPayload = null;
    this.upsertOpts = null;
    this.selectAfter = false;
  }

  select(_cols, opts = {}) {
    if (opts?.head) this.headOnly = true;
    if (opts?.count === 'exact') this.countExact = true;
    return this;
  }

  eq(col, val) {
    this.filters.push({ column: col, op: 'eq', value: val });
    return this;
  }

  neq(col, val) {
    this.filters.push({ column: col, op: 'neq', value: val });
    return this;
  }

  is(col, val) {
    this.filters.push({ column: col, op: 'is', value: val });
    return this;
  }

  gte(col, val) {
    this.filters.push({ column: col, op: 'gte', value: val });
    return this;
  }

  lte(col, val) {
    this.filters.push({ column: col, op: 'lte', value: val });
    return this;
  }

  in(col, vals) {
    this.filters.push({ column: col, op: 'in', value: vals });
    return this;
  }

  ilike(col, val) {
    this.filters.push({ column: col, op: 'like', value: val });
    return this;
  }

  like(col, val) {
    this.filters.push({ column: col, op: 'like', value: val });
    return this;
  }

  or(expr) {
    this.orFilters = expr;
    return this;
  }

  not(col, operator, value) {
    this.filters.push({ column: col, op: `not.${operator}`, value });
    return this;
  }

  order(col, { ascending = true } = {}) {
    this.orderCol = col;
    this.orderAsc = ascending;
    return this;
  }

  limit(n) {
    this.limitN = n;
    return this;
  }

  range(from, to) {
    this.offsetN = from;
    this.limitN = to - from + 1;
    return this;
  }

  single() {
    this.wantSingle = true;
    this.limitN = 1;
    return this;
  }

  maybeSingle() {
    this.wantMaybeSingle = true;
    this.limitN = 1;
    return this;
  }

  insert(payload) {
    this.mutation = 'insert';
    this.mutationPayload = payload;
    return this;
  }

  update(payload) {
    this.mutation = 'update';
    this.mutationPayload = payload;
    return this;
  }

  upsert(payload, opts = {}) {
    this.mutation = 'upsert';
    this.mutationPayload = payload;
    this.upsertOpts = opts;
    return this;
  }

  delete() {
    this.mutation = 'delete';
    return this;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }

  async execute() {
    try {
      if (this.mutation === 'insert') {
        const body = Array.isArray(this.mutationPayload) ? this.mutationPayload[0] : this.mutationPayload;
        const data = await apiFetch(`/admin/db/${this.table}`, { method: 'POST', body });
        return { data: data?.data ?? data, error: null };
      }

      if (this.mutation === 'upsert') {
        const body = Array.isArray(this.mutationPayload) ? this.mutationPayload[0] : this.mutationPayload;
        if (this.table === 'settings' && body?.key) {
          const data = await apiFetch('/admin/db/settings/upsert', { method: 'POST', body });
          return { data: data?.data ?? data, error: null };
        }
        const id = body?.id;
        if (id) {
          const data = await apiFetch(`/admin/db/${this.table}/${id}`, { method: 'PATCH', body });
          return { data: data?.data ?? data, error: null };
        }
        const data = await apiFetch(`/admin/db/${this.table}`, { method: 'POST', body });
        return { data: data?.data ?? data, error: null };
      }

      if (this.mutation === 'update') {
        const idFilter = this.filters.find((f) => f.column === 'id');
        const id = idFilter?.value;
        const data = await apiFetch(`/admin/db/${this.table}/${id}`, {
          method: 'PATCH',
          body: this.mutationPayload,
        });
        return { data: data?.data ?? data, error: null };
      }

      if (this.mutation === 'delete') {
        const idFilter = this.filters.find((f) => f.column === 'id');
        await apiFetch(`/admin/db/${this.table}/${idFilter?.value}`, { method: 'DELETE' });
        return { data: null, error: null };
      }

      const filters = [...this.filters];
      if (this.orFilters && typeof this.orFilters === 'string') {
        const parts = this.orFilters.split(',');
        for (const part of parts) {
          const m = part.trim().match(/(\w+)\.(ilike|eq)\.%([^%]+)%/);
          if (m) {
            filters.push({ column: m[1], op: 'like', value: `%${m[3]}%` });
          }
        }
      }

      const params = new URLSearchParams();
      params.set('filters', JSON.stringify(filters));
      if (this.orderCol) {
        params.set('order', JSON.stringify({ column: this.orderCol, ascending: this.orderAsc }));
      }
      if (this.limitN != null) params.set('limit', String(this.limitN));
      if (this.offsetN) params.set('offset', String(this.offsetN));
      if (this.headOnly && this.countExact) params.set('count_only', '1');

      const json = await apiFetch(`/db/${this.table}?${params.toString()}`);
      let rows = json?.data ?? [];
      const count = json?.count ?? rows.length;

      if (this.wantSingle || this.wantMaybeSingle) {
        const row = rows[0] ?? null;
        if (!row && this.wantSingle) {
          return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        }
        return { data: row, error: null, count: row ? 1 : 0 };
      }

      if (this.headOnly) {
        return { data: null, error: null, count };
      }

      return { data: rows, error: null, count };
    } catch (error) {
      return { data: null, error: { message: error.message, ...error.data }, count: 0 };
    }
  }
}

const auth = {
  async signInWithPassword({ email, password }) {
    await ensureCsrf();
    const payload = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    const session = { user: payload.user };
    emitAuth('SIGNED_IN', session);
    return { data: { user: payload.user, session }, error: null };
  },

  async signUp(credentials) {
    await ensureCsrf();
    const meta = credentials.options?.data || {};
    const payload = await apiFetch('/auth/register', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
        full_name: meta.full_name,
        mobile: meta.mobile,
        first_name: meta.first_name,
        last_name: meta.last_name,
      },
    });
    const session = { user: payload.user };
    emitAuth('SIGNED_IN', session);
    return { data: { user: payload.user, session }, error: null };
  },

  async signOut() {
    await apiFetch('/auth/logout', { method: 'POST' });
    emitAuth('SIGNED_OUT', null);
    return { error: null };
  },

  async getSession() {
    try {
      const payload = await apiFetch('/auth/user');
      if (!payload?.user) return { data: { session: null }, error: null };
      const session = { user: payload.user };
      cachedSession = session;
      return { data: { session }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  },

  async getUser() {
    const { data } = await this.getSession();
    return { data: { user: data.session?.user ?? null }, error: null };
  },

  async resetPasswordForEmail(email, _opts) {
    await apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
    return { data: {}, error: null };
  },

  async updateUser(_attrs) {
    return { data: { user: cachedSession?.user }, error: null };
  },

  async signInWithOAuth() {
    return { data: null, error: { message: 'Google sign-in is not configured yet.' } };
  },

  onAuthStateChange(callback) {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback),
        },
      },
    };
  },
};

function from(table) {
  return new QueryBuilder(table);
}

const storage = {
  from(bucket) {
    return {
      async upload(path, file) {
        await ensureCsrf();
        const fd = new FormData();
        fd.append('file', file);
        fd.append('bucket', bucket);
        const dir = path.includes('/') ? path.replace(/\/[^/]+$/, '') : '';
        fd.append('path', dir);
        const json = await apiFetch('/upload', { method: 'POST', body: fd });
        return { data: { path: json.path, fullPath: json.path, publicUrl: json.url }, error: null };
      },
      getPublicUrl(path) {
        const url = path.startsWith('http') ? path : `/storage/${path.replace(/^\/+/, '')}`;
        return { data: { publicUrl: url } };
      },
      async remove(paths) {
        await ensureCsrf();
        for (const p of paths) {
          await apiFetch('/upload', { method: 'DELETE', body: { path: p } });
        }
        return { data: null, error: null };
      },
    };
  },
};

export const supabase = { auth, from, storage };

export default supabase;
