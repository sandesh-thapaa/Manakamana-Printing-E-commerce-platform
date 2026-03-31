export type DesignStatusUi = "Pending" | "Approved" | "Rejected";

export interface DesignListItem {
  id: string;
  title: string;
  client: string;
  designer: string;
  submittedDate: string;
  status: DesignStatusUi;
  image: string;
  fileUrl?: string;
  previewUrl?: string;
  designCode?: string;
}

interface PendingDesignApi {
  id: string;
  designCode: string;
  fileUrl: string;
  previewUrl?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  client?: {
    companyName?: string | null;
    email?: string | null;
  } | null;
}

interface ApprovedDesignApi {
  id: string;
  designCode: string;
  previewUrl?: string | null;
  status: "APPROVED";
  reviewedAt?: string | null;
  createdAt: string;
  client?: {
    companyName?: string | null;
  } | null;
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toISOString().split("T")[0];
};

const safeJson = async (response: Response) => {
  const raw = await response.text();
  if (!raw || raw.trim().length === 0) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
};

const mapPendingDesign = (design: PendingDesignApi): DesignListItem => ({
  id: design.id,
  title: design.designCode || `Design Submission ${design.id.slice(0, 6)}`,
  client: design.client?.companyName || "Unknown Client",
  designer: design.client?.companyName || "Client",
  submittedDate: formatDate(design.createdAt),
  status: "Pending",
  image: design.previewUrl || design.fileUrl,
  fileUrl: design.fileUrl,
  previewUrl: design.previewUrl ?? undefined,
  designCode: design.designCode,
});

const mapApprovedDesign = (design: ApprovedDesignApi): DesignListItem => ({
  id: design.id,
  title: design.designCode || `Approved Design ${design.id.slice(0, 6)}`,
  client: design.client?.companyName || "Unknown Client",
  designer: design.client?.companyName || "Client",
  submittedDate: formatDate(design.reviewedAt || design.createdAt),
  status: "Approved",
  image: design.previewUrl || "",
  previewUrl: design.previewUrl ?? undefined,
  designCode: design.designCode,
});

export const fetchPendingDesignSubmissions = async (): Promise<DesignListItem[]> => {
  const response = await fetch("/api/admin/designs/submissions", {
    method: "GET",
    cache: "no-store",
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load design submissions.");
  }

  return (data?.data || []).map(mapPendingDesign);
};

export const fetchApprovedDesigns = async (): Promise<DesignListItem[]> => {
  const response = await fetch("/api/admin/designs", {
    method: "GET",
    cache: "no-store",
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load approved designs.");
  }

  return (data?.data || []).map(mapApprovedDesign);
};

export const approveDesignSubmission = async (
  submissionId: string,
  previewUrl: string
) => {
  const response = await fetch("/api/admin/designs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionId, previewUrl }),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Failed to approve design.");
  }

  return data;
};

export const rejectDesignSubmission = async (
  submissionId: string,
  reason: string
) => {
  const response = await fetch(
    `/api/admin/designs/submissions/${submissionId}/reject`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }
  );

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Failed to reject design.");
  }

  return data;
};
