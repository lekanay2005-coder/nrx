import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache for state
let cacheConfig = null;

const STORAGE_KEYS = {
  ENDPOINT: '@nexus_mongodb_endpoint',
  API_KEY: '@nexus_mongodb_api_key',
  DATABASE: '@nexus_mongodb_database',
  CLUSTER: '@nexus_mongodb_cluster',
  SYNCED_POSTS: '@nexus_mongodb_synced_posts',
  SYNCED_MESSAGES: '@nexus_mongodb_synced_messages',
};

// Default sandbox configuration values
const SANDBOX_CONFIG = {
  endpoint: 'https://data.mongodb-api.com/app/data-abcde/endpoint/data/v1',
  apiKey: 'SANDBOX_MODE_ACTIVE_NO_KEY_PROVIDED',
  database: 'nexus_social_db',
  cluster: 'Cluster0',
};

/**
 * Loads current MongoDB connection parameters
 */
export async function getMongoDBConfig() {
  if (cacheConfig) return cacheConfig;

  try {
    const endpoint = await AsyncStorage.getItem(STORAGE_KEYS.ENDPOINT);
    const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    const database = await AsyncStorage.getItem(STORAGE_KEYS.DATABASE);
    const cluster = await AsyncStorage.getItem(STORAGE_KEYS.CLUSTER);

    if (endpoint && apiKey) {
      cacheConfig = { endpoint, apiKey, database: database || 'nexus_social_db', cluster: cluster || 'Cluster0', isSandbox: false };
    } else {
      cacheConfig = { ...SANDBOX_CONFIG, isSandbox: true };
    }
    return cacheConfig;
  } catch (error) {
    console.error('Error loading MongoDB config:', error);
    return { ...SANDBOX_CONFIG, isSandbox: true };
  }
}

/**
 * Saves MongoDB Atlas connection parameters
 */
export async function saveMongoDBConfig({ endpoint, apiKey, database, cluster }) {
  try {
    if (!endpoint || !apiKey) {
      // Revert to sandbox
      await AsyncStorage.removeItem(STORAGE_KEYS.ENDPOINT);
      await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
      await AsyncStorage.removeItem(STORAGE_KEYS.DATABASE);
      await AsyncStorage.removeItem(STORAGE_KEYS.CLUSTER);
      cacheConfig = { ...SANDBOX_CONFIG, isSandbox: true };
      return true;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.ENDPOINT, endpoint.trim());
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
    await AsyncStorage.setItem(STORAGE_KEYS.DATABASE, database ? database.trim() : 'nexus_social_db');
    await AsyncStorage.setItem(STORAGE_KEYS.CLUSTER, cluster ? cluster.trim() : 'Cluster0');

    cacheConfig = {
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim(),
      database: database ? database.trim() : 'nexus_social_db',
      cluster: cluster ? cluster.trim() : 'Cluster0',
      isSandbox: false,
    };
    return true;
  } catch (error) {
    console.error('Error saving MongoDB config:', error);
    return false;
  }
}

/**
 * Test connectivity by making a simple metadata pin/query request to the endpoint
 */
export async function testConnection(customConfig = null) {
  const config = customConfig || await getMongoDBConfig();
  if (config.isSandbox) {
    return { success: true, message: 'Sandbox mode connection active (local simulation state).' };
  }

  try {
    const response = await fetch(`${config.endpoint}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'Access-Control-Request-Headers': '*',
      },
      body: JSON.stringify({
        dataSource: config.cluster,
        database: config.database,
        collection: 'posts',
        limit: 1,
      }),
    });

    if (response.status === 200) {
      return { success: true, message: 'Connection to MongoDB Atlas established successfully!' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `Atlas error ${response.status}: ${errorText || 'Unknown error'}` };
    }
  } catch (e) {
    return { success: false, message: `Network failed: ${e.message}` };
  }
}

/**
 * Pushes document to a MongoDB Atlas Collection
 */
export async function insertMongoDBDocument(collectionName, document) {
  const config = await getMongoDBConfig();
  if (config.isSandbox) {
    console.log(`[MongoDB Sandbox] Inserted into ${collectionName}:`, document);
    return { success: true, insertedId: 'sandbox_' + Date.now() };
  }

  try {
    const response = await fetch(`${config.endpoint}/action/insertOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'Access-Control-Request-Headers': '*',
      },
      body: JSON.stringify({
        dataSource: config.cluster,
        database: config.database,
        collection: collectionName,
        document: {
          ...document,
          createdAt: document.createdAt || new Date().toISOString(),
        },
      }),
    });

    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      return { success: true, insertedId: result.insertedId };
    }
    const errorText = await response.text();
    let parsedError = errorText;
    try {
      const json = JSON.parse(errorText);
      if (json.error) parsedError = json.error;
    } catch (e) {}
    return { success: false, error: parsedError };
  } catch (error) {
    console.error(`MongoDB insert error in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync entire local data batch to MongoDB Atlas (upsert mode by replacing existings)
 */
export async function syncBatchToMongoDB(collectionName, documents) {
  const config = await getMongoDBConfig();
  if (config.isSandbox) {
    console.log(`[MongoDB Sandbox] Synced batch of ${documents.length} docs to ${collectionName}.`);
    return { success: true };
  }

  try {
    // 1. Delete matching existing to prevent duplicates on manual sync trigger, then insert new batch
    // Since Data API lacks a simple upsertMany, we insertMany the entire collection
    const deleteRes = await fetch(`${config.endpoint}/action/deleteMany`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'Access-Control-Request-Headers': '*',
      },
      body: JSON.stringify({
        dataSource: config.cluster,
        database: config.database,
        collection: collectionName,
        filter: {},
      }),
    });

    if (deleteRes.status !== 200 && deleteRes.status !== 201) {
      const errorText = await deleteRes.text();
      let parsedError = errorText;
      try {
        const json = JSON.parse(errorText);
        if (json.error) parsedError = json.error;
      } catch (e) {}
      return { success: false, error: parsedError };
    }

    if (documents.length === 0) return { success: true };

    const insertRes = await fetch(`${config.endpoint}/action/insertMany`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'Access-Control-Request-Headers': '*',
      },
      body: JSON.stringify({
        dataSource: config.cluster,
        database: config.database,
        collection: collectionName,
        documents: documents.map(d => ({ ...d, syncedAt: new Date().toISOString() })),
      }),
    });

    if (insertRes.status === 200 || insertRes.status === 201) {
      return { success: true };
    }
    return { success: false, error: 'Batch upload failed code ' + insertRes.status };
  } catch (err) {
    console.error(`MongoDB syncBatch error in ${collectionName}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch documents from a collection matching an optional filter
 */
export async function fetchMongoDBCollection(collectionName, filter = {}, sort = { createdAt: -1 }) {
  const config = await getMongoDBConfig();
  if (config.isSandbox) {
    console.log(`[MongoDB Sandbox] Fetching from ${collectionName} with filter:`, filter);
    return null; // Signals sandbox fallback should keep local state instead of overriding
  }

  try {
    const response = await fetch(`${config.endpoint}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'Access-Control-Request-Headers': '*',
      },
      body: JSON.stringify({
        dataSource: config.cluster,
        database: config.database,
        collection: collectionName,
        filter,
        sort,
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.documents || [];
    }
    return null;
  } catch (error) {
    console.error(`MongoDB fetch error for ${collectionName}:`, error);
    return null;
  }
}
