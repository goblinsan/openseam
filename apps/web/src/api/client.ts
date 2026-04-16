import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const accountsApi = {
  list: (params?: { search?: string; isDesignPartner?: boolean }) =>
    apiClient.get('/accounts', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/accounts/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/accounts', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/accounts/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/accounts/${id}`).then((r) => r.data),
};

export const contactsApi = {
  list: (params?: { accountId?: string }) =>
    apiClient.get('/contacts', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/contacts/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/contacts', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/contacts/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/contacts/${id}`).then((r) => r.data),
};

export const leadsApi = {
  list: (params?: { status?: string; search?: string }) =>
    apiClient.get('/leads', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/leads/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/leads', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/leads/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/leads/${id}`).then((r) => r.data),
};

export const opportunitiesApi = {
  list: (params?: { stage?: string; isDesignPartner?: boolean }) =>
    apiClient.get('/opportunities', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/opportunities/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/opportunities', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/opportunities/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/opportunities/${id}`).then((r) => r.data),
};

export const interviewsApi = {
  listTemplates: () => apiClient.get('/interviews/templates').then((r) => r.data),
  createTemplate: (data: unknown) =>
    apiClient.post('/interviews/templates', data).then((r) => r.data),
  list: (params?: { accountId?: string; status?: string }) =>
    apiClient.get('/interviews', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/interviews/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/interviews', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/interviews/${id}`, data).then((r) => r.data),
};

export const evidenceApi = {
  list: (params?: { category?: string; accountId?: string; search?: string }) =>
    apiClient.get('/evidence', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/evidence/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/evidence', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/evidence/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/evidence/${id}`).then((r) => r.data),
};

export const hypothesesApi = {
  list: () => apiClient.get('/hypotheses').then((r) => r.data),
  get: (id: string) => apiClient.get(`/hypotheses/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/hypotheses', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/hypotheses/${id}`, data).then((r) => r.data),
};

export const intakeApi = {
  list: () => apiClient.get('/intake').then((r) => r.data),
  get: (id: string) => apiClient.get(`/intake/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/intake', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/intake/${id}`, data).then((r) => r.data),
  submit: (id: string) => apiClient.post(`/intake/${id}/submit`).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/intake/${id}`).then((r) => r.data),
};

export const scoringApi = {
  list: () => apiClient.get('/scoring').then((r) => r.data),
  calculate: (data: unknown) => apiClient.post('/scoring/calculate', data).then((r) => r.data),
  get: (accountId: string) => apiClient.get(`/scoring/${accountId}`).then((r) => r.data),
  rankings: () => apiClient.get('/scoring/rankings').then((r) => r.data),
  updateWeights: (data: unknown) => apiClient.patch('/scoring/weights', data).then((r) => r.data),
};

export const assessmentsApi = {
  list: () => apiClient.get('/assessments').then((r) => r.data),
  get: (id: string) => apiClient.get(`/assessments/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/assessments', data).then((r) => r.data),
  update: (id: string, data: unknown) => apiClient.patch(`/assessments/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/assessments/${id}`).then((r) => r.data),
};

export const inventoryApi = {
  generate: (assessmentId: string) => apiClient.post(`/inventory/${assessmentId}/generate`).then((r) => r.data),
  get: (assessmentId: string) => apiClient.get(`/inventory/${assessmentId}`).then((r) => r.data),
};

export const portabilityScoringApi = {
  calculate: (assessmentId: string) => apiClient.post(`/portability-scoring/${assessmentId}/calculate`).then((r) => r.data),
  get: (assessmentId: string) => apiClient.get(`/portability-scoring/${assessmentId}`).then((r) => r.data),
};

export const recommendationsApi = {
  generate: (assessmentId: string) => apiClient.post(`/recommendations/${assessmentId}/generate`).then((r) => r.data),
  get: (assessmentId: string) => apiClient.get(`/recommendations/${assessmentId}`).then((r) => r.data),
};

export const reportsApi = {
  generate: (assessmentId: string) => apiClient.post(`/reports/${assessmentId}/generate`).then((r) => r.data),
  getByAssessment: (assessmentId: string) => apiClient.get(`/reports/assessment/${assessmentId}`).then((r) => r.data),
  get: (id: string) => apiClient.get(`/reports/${id}`).then((r) => r.data),
};

export const patternsApi = {
  list: (params?: { category?: string }) =>
    apiClient.get('/patterns', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/patterns/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/patterns', data).then((r) => r.data),
  update: (id: string, data: unknown) => apiClient.patch(`/patterns/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/patterns/${id}`).then((r) => r.data),
  categories: () => apiClient.get('/patterns/categories').then((r) => r.data),
};

export const workspacesApi = {
  list: () => apiClient.get('/workspaces').then((r) => r.data),
  get: (id: string) => apiClient.get(`/workspaces/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/workspaces', data).then((r) => r.data),
  update: (id: string, data: unknown) => apiClient.patch(`/workspaces/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/workspaces/${id}`).then((r) => r.data),
};

export const projectsApi = {
  list: (params?: { workspaceId?: string }) =>
    apiClient.get('/projects', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/projects/${id}`).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/projects', data).then((r) => r.data),
  update: (id: string, data: unknown) => apiClient.patch(`/projects/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`).then((r) => r.data),
};

export const environmentsApi = {
  list: (projectId: string) =>
    apiClient.get('/environments', { params: { projectId } }).then((r) => r.data),
  create: (data: unknown) => apiClient.post('/environments', data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/environments/${id}`).then((r) => r.data),
};

export const validatorApi = {
  validateManifest: (payload: unknown) => apiClient.post('/validate/manifest', { payload }).then((r) => r.data),
  validatePattern: (payload: unknown) => apiClient.post('/validate/pattern', { payload }).then((r) => r.data),
  validateBlueprint: (payload: unknown) => apiClient.post('/validate/blueprint', { payload }).then((r) => r.data),
  listRules: () => apiClient.get('/validate/rules').then((r) => r.data),
};
