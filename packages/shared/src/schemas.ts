import { z } from 'zod'

export const searchBrainSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().default(10)
})

export const readFileSchema = z.object({
  path: z.string().min(1)
})

export const createNoteSchema = z.object({
  path: z.string().optional(),
  content: z.string().min(1)
})

export const appendNoteSchema = z.object({
  path: z.string().min(1),
  content: z.string().min(1)
})

export const exportCludePlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string(),
  projectGoal: z.string(),
  techStack: z.string(),
  implementationPlan: z.string(),
  tasks: z.array(z.string()),
  acceptanceCriteria: z.array(z.string())
})

export const deviceRegisterSchema = z.object({
  name: z.string().min(1)
})

export const searchResultSchema = z.object({
  path: z.string(),
  title: z.string(),
  score: z.number(),
  snippet: z.string(),
  modifiedAt: z.string()
})
