import { z } from 'zod';
export declare const searchBrainSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
}, {
    query: string;
    limit?: number | undefined;
}>;
export declare const readFileSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const createNoteSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    path?: string | undefined;
}, {
    content: string;
    path?: string | undefined;
}>;
export declare const appendNoteSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    content: string;
}, {
    path: string;
    content: string;
}>;
export declare const exportCludePlanSchema: z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    projectGoal: z.ZodString;
    techStack: z.ZodString;
    implementationPlan: z.ZodString;
    tasks: z.ZodArray<z.ZodString, "many">;
    acceptanceCriteria: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    summary: string;
    projectGoal: string;
    techStack: string;
    implementationPlan: string;
    tasks: string[];
    acceptanceCriteria: string[];
}, {
    title: string;
    summary: string;
    projectGoal: string;
    techStack: string;
    implementationPlan: string;
    tasks: string[];
    acceptanceCriteria: string[];
}>;
export declare const deviceRegisterSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const searchResultSchema: z.ZodObject<{
    path: z.ZodString;
    title: z.ZodString;
    score: z.ZodNumber;
    snippet: z.ZodString;
    modifiedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    title: string;
    score: number;
    snippet: string;
    modifiedAt: string;
}, {
    path: string;
    title: string;
    score: number;
    snippet: string;
    modifiedAt: string;
}>;
