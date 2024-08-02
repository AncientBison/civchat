"use server";

import { getClient } from "@/lib/redis";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function connectToQueue() {
    const id = randomUUID();
    cookies().set("id", id);
    const client = await getClient();
    client.lPush("queue", id);
    // redirect("/survey");
}