const DEFAULT_FOLDER_PATH = 'Shared';

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function getConfig() {
  const baseUrl = normalizeBaseUrl(process.env.UIPATH_URL);
  const accessToken = process.env.UIPATH_ACCESS_TOKEN;
  const folderPath = process.env.UIPATH_FOLDER_PATH || DEFAULT_FOLDER_PATH;
  const releaseKey = process.env.UIPATH_PROCESS_RELEASE_KEY;
  const processKey = process.env.UIPATH_PROCESS_KEY;

  if (!baseUrl) {
    throw new Error('UIPATH_URL is required to start the UiPath agentic process.');
  }

  if (!accessToken) {
    throw new Error('UIPATH_ACCESS_TOKEN is required to start the UiPath agentic process.');
  }

  if (!releaseKey && !processKey) {
    throw new Error('Set UIPATH_PROCESS_RELEASE_KEY or UIPATH_PROCESS_KEY for the published UiPath process.');
  }

  return {
    baseUrl,
    accessToken,
    folderPath,
    releaseKey,
    processKey,
  };
}

function headers(config) {
  return {
    Authorization: `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-UIPATH-FolderPath': config.folderPath,
  };
}

async function parseResponse(response) {
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch (_error) {
      body = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(body?.message || body?.error?.message || `UiPath request failed with ${response.status}`);
    error.statusCode = response.status;
    error.details = body;
    throw error;
  }

  return body;
}

async function resolveReleaseKey(config) {
  if (config.releaseKey) {
    return config.releaseKey;
  }

  const filter = encodeURIComponent(`ProcessKey eq '${config.processKey}'`);
  const url = `${config.baseUrl}/orchestrator_/odata/Releases?$top=1&$filter=${filter}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: headers(config),
  });
  const body = await parseResponse(response);
  const release = body?.value?.[0];

  if (!release?.Key) {
    const error = new Error(`UiPath release not found for process key ${config.processKey}.`);
    error.statusCode = 502;
    throw error;
  }

  return release.Key;
}

async function startAgenticProcess(inputArguments) {
  const config = getConfig();
  const releaseKey = await resolveReleaseKey(config);
  const url = `${config.baseUrl}/orchestrator_/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
  const response = await fetch(url, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({
      startInfo: {
        ReleaseKey: releaseKey,
        Strategy: 'ModernJobsCount',
        JobsCount: 1,
        InputArguments: JSON.stringify(inputArguments),
      },
    }),
  });
  const body = await parseResponse(response);
  const job = body?.value?.[0] || body;

  return {
    id: job?.Id ? String(job.Id) : null,
    key: job?.Key || null,
    state: job?.State || 'Pending',
    releaseKey,
    raw: body,
  };
}

async function getJob(jobId) {
  const config = getConfig();
  const url = `${config.baseUrl}/orchestrator_/odata/Jobs(${encodeURIComponent(jobId)})`;
  const response = await fetch(url, {
    method: 'GET',
    headers: headers(config),
  });
  const job = await parseResponse(response);

  return {
    id: job?.Id ? String(job.Id) : String(jobId),
    key: job?.Key || null,
    state: job?.State || 'Unknown',
    outputArguments: parseOutputArguments(job?.OutputArguments),
    error: job?.Info || job?.Source || null,
    raw: job,
  };
}

function parseOutputArguments(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return { rawOutputArguments: value };
  }
}

module.exports = {
  startAgenticProcess,
  getJob,
};
