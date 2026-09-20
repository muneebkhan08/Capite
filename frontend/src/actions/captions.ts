"use server";

import { db } from "~/lib/db";
import { env } from "~/lib/env";
import type {
  CaptionJob,
  CaptionJobStatus,
  CaptionPhase,
  CaptionStyle,
  BackendStatusResponse,
  FontStyleOption,
  TextCasingOption,
  TranscriptData,
  RerenderJobRequest,
} from "~/types/caption";

function mapPrismaJobToType(job: {
  id: string;
  displayName: string | null;
  originalFileName: string;
  fileSize: number;
  durationSeconds: number | null;
  captionStyle: string;
  captionPosition: number;
  customFont?: string | null;
  fontWeight?: string | null;
  weightTransition?: string | null;
  fontStyle?: string | null;
  textCasing?: string | null;
  primaryColor?: string | null;
  highlightColor?: string | null;
  outlineColor?: string | null;
  backgroundColor?: string | null;
  status: string;
  progress: number;
  currentPhase: string | null;
  language: string | null;
  errorMessage: string | null;
  backendJobId: string | null;
  processingTimeMs: number | null;
  outputFileSize: number | null;
  createdAt: Date;
  updatedAt: Date;
}): CaptionJob {
  return {
    id: job.id,
    displayName: job.displayName,
    originalFileName: job.originalFileName,
    fileSize: job.fileSize,
    durationSeconds: job.durationSeconds,
    captionStyle: job.captionStyle as CaptionStyle,
    captionPosition: job.captionPosition,
    customFont: job.customFont ?? null,
    fontWeight: job.fontWeight ?? null,
    weightTransition: job.weightTransition ?? null,
    fontStyle: (job.fontStyle as FontStyleOption) ?? null,
    textCasing: (job.textCasing as TextCasingOption) ?? null,
    primaryColor: job.primaryColor ?? null,
    highlightColor: job.highlightColor ?? null,
    outlineColor: job.outlineColor ?? null,
    backgroundColor: job.backgroundColor ?? null,
    status: job.status as CaptionJobStatus,
    progress: job.progress,
    currentPhase: job.currentPhase as CaptionPhase | null,
    language: job.language,
    errorMessage: job.errorMessage,
    backendJobId: job.backendJobId,
    processingTimeMs: job.processingTimeMs,
    outputFileSize: job.outputFileSize,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

const TERMINAL_STATUSES: CaptionJobStatus[] = ["completed", "failed"];

export async function submitCaptionJob(
  formData: FormData
): Promise<{ jobId: string } | { error: string }> {
  try {
    const file = formData.get("file") as File | null;
    const captionStyle = formData.get("captionStyle") as string | null;
    const captionPosition = formData.get("captionPosition") as string | null;
    const durationSeconds = formData.get("durationSeconds") as string | null;
    const customFont = formData.get("customFont") as string | null;
    const fontWeight = formData.get("fontWeight") as string | null;
    const weightTransition = formData.get("weightTransition") as string | null;
    const fontStyle = formData.get("fontStyle") as string | null;
    const textCasing = formData.get("textCasing") as string | null;
    const primaryColor = formData.get("primaryColor") as string | null;
    const highlightColor = formData.get("highlightColor") as string | null;
    const outlineColor = formData.get("outlineColor") as string | null;
    const backgroundColor = formData.get("backgroundColor") as string | null;

    if (!file) {
      return { error: "No file provided" };
    }
    if (!captionStyle) {
      return { error: "No caption style provided" };
    }
    if (!captionPosition) {
      return { error: "No caption position provided" };
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("captionStyle", captionStyle);
    backendFormData.append("captionPosition", captionPosition);
    if (durationSeconds) {
      backendFormData.append("durationSeconds", durationSeconds);
    }
    if (customFont) {
      backendFormData.append("customFont", customFont);
    }
    if (fontWeight) {
      backendFormData.append("fontWeight", fontWeight);
    }
    if (weightTransition) {
      backendFormData.append("weightTransition", weightTransition);
    }
    if (fontStyle) {
      backendFormData.append("fontStyle", fontStyle);
    }
    if (textCasing) {
      backendFormData.append("textCasing", textCasing);
    }
    if (primaryColor) {
      backendFormData.append("primaryColor", primaryColor);
    }
    if (highlightColor) {
      backendFormData.append("highlightColor", highlightColor);
    }
    if (outlineColor) {
      backendFormData.append("outlineColor", outlineColor);
    }
    if (backgroundColor) {
      backendFormData.append("backgroundColor", backgroundColor);
    }

    const response = await fetch(`${env.BACKEND_URL}/api/process`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Backend error: ${errorText}` };
    }

    const data = (await response.json()) as { jobId: string };

    const prismaRecord = await db.captionJob.create({
      data: {
        originalFileName: file.name,
        fileSize: file.size,
        durationSeconds: durationSeconds ? parseFloat(durationSeconds) : null,
        captionStyle,
        captionPosition: parseInt(captionPosition, 10),
        customFont: customFont || null,
        fontWeight: fontWeight || null,
        weightTransition: weightTransition || null,
        fontStyle: fontStyle || null,
        textCasing: textCasing || null,
        primaryColor: primaryColor || null,
        highlightColor: highlightColor || null,
        outlineColor: outlineColor || null,
        backgroundColor: backgroundColor || null,
        status: "processing",
        backendJobId: data.jobId,
      },
    });

    return { jobId: prismaRecord.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message };
  }
}

export async function getCaptionJobStatus(
  jobId: string,
  forceRefresh = false
): Promise<CaptionJob | null> {
  const job = await db.captionJob.findUnique({ where: { id: jobId } });
  if (!job) return null;

  if (!forceRefresh && TERMINAL_STATUSES.includes(job.status as CaptionJobStatus)) {
    return mapPrismaJobToType(job);
  }

  if (!job.backendJobId) {
    return mapPrismaJobToType(job);
  }

  try {
    const response = await fetch(
      `${env.BACKEND_URL}/api/status/${job.backendJobId}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return mapPrismaJobToType(job);
    }

    const backendData = (await response.json()) as BackendStatusResponse;

    const updated = await db.captionJob.update({
      where: { id: jobId },
      data: {
        status: backendData.status as CaptionJobStatus,
        progress: backendData.progress,
        currentPhase: backendData.currentPhase,
        language: backendData.language,
        durationSeconds: backendData.durationSeconds ?? job.durationSeconds,
        errorMessage: backendData.errorMessage,
        processingTimeMs: backendData.processingTimeMs,
      },
    });

    return mapPrismaJobToType(updated);
  } catch {
    return mapPrismaJobToType(job);
  }
}

export async function getCaptionJobs(): Promise<CaptionJob[]> {
  const jobs = await db.captionJob.findMany({
    orderBy: { createdAt: "desc" },
  });
  return jobs.map(mapPrismaJobToType);
}

export async function getCaptionJobById(
  jobId: string
): Promise<CaptionJob | null> {
  const job = await db.captionJob.findUnique({ where: { id: jobId } });
  if (!job) return null;
  return mapPrismaJobToType(job);
}

export async function deleteCaptionJob(jobId: string): Promise<void> {
  const job = await db.captionJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  if (job.backendJobId) {
    try {
      await fetch(`${env.BACKEND_URL}/api/jobs/${job.backendJobId}`, {
        method: "DELETE",
      });
    } catch {
      // Best-effort delete from backend; proceed to delete from DB
    }
  }

  await db.captionJob.delete({ where: { id: jobId } });
}

export async function getCaptionJobTranscript(
  jobId: string
): Promise<TranscriptData | null> {
  const job = await db.captionJob.findUnique({ where: { id: jobId } });
  if (!job || !job.backendJobId) return null;

  try {
    const response = await fetch(
      `${env.BACKEND_URL}/api/transcript/${job.backendJobId}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as TranscriptData;
    return data;
  } catch {
    return null;
  }
}

export async function rerenderCaptionJob(
  jobId: string,
  payload: RerenderJobRequest
): Promise<{ success: boolean; error?: string }> {
  const job = await db.captionJob.findUnique({ where: { id: jobId } });
  if (!job || !job.backendJobId) {
    return { success: false, error: "Job not found" };
  }

  try {
    await db.captionJob.update({
      where: { id: jobId },
      data: {
        captionStyle: payload.captionStyle,
        captionPosition: payload.captionPosition,
        customFont: payload.customFont || null,
        fontWeight: payload.fontWeight || null,
        weightTransition: payload.weightTransition || null,
        fontStyle: payload.fontStyle || null,
        textCasing: payload.textCasing || null,
        primaryColor: payload.primaryColor || null,
        highlightColor: payload.highlightColor || null,
        outlineColor: payload.outlineColor || null,
        backgroundColor: payload.backgroundColor || null,
        status: "processing",
        currentPhase: "burning",
        progress: 50,
      },
    });

    const response = await fetch(
      `${env.BACKEND_URL}/api/rerender/${job.backendJobId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Backend re-render error: ${errText}` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to re-render";
    return { success: false, error: message };
  }
}

