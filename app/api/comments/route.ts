import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { listingId },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              profile_image: true,
              university: true
            }
          }
        }
      }),
      prisma.comment.count({ where: { listingId } })
    ]);

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        timeAgo: formatDistanceToNow(comment.created_at, { addSuffix: true }),
        user: {
          id: comment.user.id,
          name: comment.user.full_name,
          profile_image: comment.user.profile_image,
          university: comment.user.university
        }
      })),
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + comments.length < total
      }
    });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, content } = await request.json();
    if (!listingId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        listingId,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
            university: true
          }
        }
      }
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      timeAgo: formatDistanceToNow(comment.created_at, { addSuffix: true }),
      user: {
        id: comment.user.id,
        name: comment.user.full_name,
        profile_image: comment.user.profile_image,
        university: comment.user.university
      }
    });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
