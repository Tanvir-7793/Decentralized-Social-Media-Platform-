/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Block where your NEW Social contract was deployed
export const FROM_BLOCK = 57869952n;

export type Post = { id: string; author: string; cid: string; replyTo: string };

const low = (s: string) => s.toLowerCase();
const order = (l: any) => Number(l.blockNumber) * 100000 + Number(l.logIndex);
export const isCid = (s: string) => /^(Qm|bafy|bafk)/.test(s);
export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const GATEWAYS = ["https://ipfs.io/ipfs/", "https://dweb.link/ipfs/", "https://gateway.pinata.cloud/ipfs/"];
const jsonCache = new Map<string, any>();

// Loads JSON from IPFS, trying several gateways at once
export async function loadJson(cid: string) {
  if (jsonCache.has(cid)) return jsonCache.get(cid);
  const data = await Promise.any(
    GATEWAYS.map(g =>
      fetch(g + cid).then(r => {
        if (!r.ok) throw new Error("gateway failed");
        return r.json();
      }),
    ),
  );
  jsonCache.set(cid, data);
  return data;
}

async function pin(text: string) {
  const r = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.cid as string;
}

const add = (m: Map<string, Set<string>>, k: string, v: string) => {
  if (!m.has(k)) m.set(k, new Set());
  m.get(k)!.add(v);
};

export function useSocial() {
  const { address } = useAccount();
  const me = address ? low(address) : undefined;
  const { targetNetwork } = useTargetNetwork();
  const client = usePublicClient({ chainId: targetNetwork.id });
  const { data: info, isLoading: infoLoading } = useDeployedContractInfo({ contractName: "Social" });
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "Social" });

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optLike, setOptLike] = useState<Record<string, boolean>>({});
  const [optFollow, setOptFollow] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    if (!client || !info) return;
    try {
      const l = await client.getContractEvents({
        address: info.address,
        abi: info.abi,
        fromBlock: FROM_BLOCK,
      } as any);
      setLogs(l as any[]);
      setError(null);
    } catch (e: any) {
      setError(e?.shortMessage ?? "Couldn't load posts from the network. Retrying…");
    } finally {
      setLoading(false);
    }
  }, [client, info]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [refresh]);

  // Turn raw chain events into app state
  const m = useMemo(() => {
    const profiles = new Map<string, { handle: string; cid: string }>();
    const posts = new Map<string, Post>();
    const replies = new Map<string, string[]>();
    const likes = new Map<string, Set<string>>();
    const following = new Map<string, Set<string>>();
    const followers = new Map<string, Set<string>>();

    [...logs]
      .sort((a, b) => order(a) - order(b))
      .forEach((l: any) => {
        const a = l.args;
        switch (l.eventName) {
          case "ProfileSet":
            profiles.set(low(a.user), { handle: a.handle, cid: a.metadataCID });
            break;
          case "Posted": {
            const id = String(a.id);
            const replyTo = String(a.replyTo);
            posts.set(id, { id, author: low(a.author), cid: a.contentCID, replyTo });
            if (replyTo !== "0") replies.set(replyTo, [...(replies.get(replyTo) ?? []), id]);
            break;
          }
          case "Liked":
            add(likes, String(a.postId), low(a.user));
            break;
          case "Unliked":
            likes.get(String(a.postId))?.delete(low(a.user));
            break;
          case "Followed":
            add(following, low(a.follower), low(a.followee));
            add(followers, low(a.followee), low(a.follower));
            break;
          case "Unfollowed":
            following.get(low(a.follower))?.delete(low(a.followee));
            followers.get(low(a.followee))?.delete(low(a.follower));
            break;
        }
      });
    return { profiles, posts, replies, likes, following, followers };
  }, [logs]);

  const allPosts = useMemo(() => [...m.posts.values()].reverse(), [m.posts]);
  const topPosts = useMemo(() => allPosts.filter(p => p.replyTo === "0"), [allPosts]);

  // ---- derived values, with instant (optimistic) updates ----
  const liked = (id: string) => (id in optLike ? optLike[id] : !!(me && m.likes.get(id)?.has(me)));
  const likeCount = (id: string) => {
    const base = m.likes.get(id);
    let n = base?.size ?? 0;
    if (me && id in optLike) n += (optLike[id] ? 1 : 0) - (base?.has(me) ? 1 : 0);
    return n;
  };
  const following = (a: string) => (a in optFollow ? optFollow[a] : !!(me && m.following.get(me)?.has(a)));
  const followerCount = (a: string) => {
    const base = m.followers.get(a);
    let n = base?.size ?? 0;
    if (me && a in optFollow) n += (optFollow[a] ? 1 : 0) - (base?.has(me) ? 1 : 0);
    return n;
  };
  const followingCount = (a: string) => m.following.get(a)?.size ?? 0;

  // ---- actions ----
  const send = async (functionName: string, args: any[]) => {
    const hash: any = await writeContractAsync({ functionName, args } as any);
    if (hash && client) await client.waitForTransactionReceipt({ hash });
    await refresh();
  };

  const clear = (set: any, key: string) =>
    set((s: any) => {
      const n = { ...s };
      delete n[key];
      return n;
    });

  const toggleLike = async (id: string) => {
    if (!me) return notification.error("Connect a wallet to like posts.");
    const next = !liked(id);
    setOptLike(s => ({ ...s, [id]: next }));
    try {
      await send(next ? "like" : "unlike", [BigInt(id)]);
    } catch (e: any) {
      notification.error(e?.shortMessage ?? "That didn't go through.");
    } finally {
      clear(setOptLike, id);
    }
  };

  const toggleFollow = async (a: string) => {
    if (!me) return notification.error("Connect a wallet to follow people.");
    const next = !following(a);
    setOptFollow(s => ({ ...s, [a]: next }));
    try {
      await send(next ? "follow" : "unfollow", [a]);
    } catch (e: any) {
      notification.error(e?.shortMessage ?? "That didn't go through.");
    } finally {
      clear(setOptFollow, a);
    }
  };

  const publish = async (text: string, replyTo = "0") => {
    try {
      const cid = await pin(text);
      await send("post", [cid, BigInt(replyTo)]);
      return true;
    } catch (e: any) {
      notification.error(e?.shortMessage ?? e?.message ?? "Couldn't publish.");
      return false;
    }
  };

  const saveProfile = async (rawHandle: string, bio: string) => {
    const h = rawHandle.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(h)) {
      notification.error("Handles use 3–20 letters, numbers or underscores.");
      return false;
    }
    const taken = [...m.profiles.entries()].find(([a, p]) => p.handle === h && a !== me);
    if (taken) {
      notification.error(`@${h} is taken. Try another handle.`);
      return false;
    }
    try {
      const cid = bio.trim() ? await pin(bio.trim()) : "";
      await send("setProfile", [h, cid]);
      return true;
    } catch (e: any) {
      notification.error(e?.shortMessage ?? "Couldn't save your profile.");
      return false;
    }
  };

  return {
    me,
    ...m,
    allPosts,
    topPosts,
    loading: loading || infoLoading,
    error: error ?? (!infoLoading && !info ? "The Social contract isn't deployed on this network." : null),
    contractAddress: info?.address as string | undefined,
    liked,
    likeCount,
    following,
    followerCount,
    followingCount,
    toggleLike,
    toggleFollow,
    publish,
    saveProfile,
  };
}

export type SocialState = ReturnType<typeof useSocial>;
