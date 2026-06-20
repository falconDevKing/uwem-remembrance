import { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";
import { getRegistrationByInviteCode } from "@/lib/registrations";
import { generateInviteImage } from "@/lib/invite-image";

export async function GET(request: NextRequest, { params }: { params: Promise<{ inviteCode: string }> }) {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { inviteCode } = await params;
  const registration = await getRegistrationByInviteCode(inviteCode);
  if (!registration) {
    return new Response("Registration not found", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;
  const verifyUrl = `${siteUrl}/verify/${inviteCode}`;

  const imageBuffer = await generateInviteImage(registration.full_name, verifyUrl);

  const fileName = `${registration.full_name} - Invite.jpeg`;
  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
