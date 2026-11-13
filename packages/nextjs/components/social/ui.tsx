/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Post, SocialState, isCid, loadJson, loadImage, short } from "~~/hooks/useSocial";

export const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
export const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const surface = "bg-[#0a0a0a]";
export const card = "bg-[#111111]";
export const border = "border border-[#202020]/60";
export const textMain = "text-[#f7f9f9]";
export const textDim = "text-[#71767b]";
export const textMuted = "text-[#536471]";
export const accent = "text-[#1d9bf0]";
export const accentBg = "bg-[#1d9bf0]";
export const likeRed = "text-[#f4212e]";

export const fMain = "font-sans text-[15px] leading-tight";
export const fHandle = "font-sans text-[14px] text-[#71767b]";
export const fName = "font-semibold text-[#f7f9f9]";

export const field =
  "w-full rounded-xl border border-[#202020] bg-[#0a0a0a] px-4 py-3 text-[#f7f9f9] outline-none placeholder:text-[#536471] focus:border-[#1d9bf0] transition-colors";

// A unique colour orb per wallet address (fallback when no avatar)
export function Orb({ address, size = 40 }: { address: string; size?: number }) {
  const n = (i: number) => parseInt(address.slice(2 + i * 4, 6 + i * 4), 16);
  const h1 = n(0) % 360;
  const h2 = (h1 + 60 + (n(1) % 140)) % 360;
  return (
    <div
      aria-hidden
      className="shrink-0 rounded-full overflow-hidden border border-[#202020]/40"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from ${n(2) % 360}deg, hsl(${h1} 70% 55%), hsl(${h2} 80% 60%), hsl(${h1} 65% 45%), hsl(${h1} 70% 55%))`,
      }}
    />
  );
}

// Avatar: shows IPFS image if avatarCid provided, otherwise falls back to Orb
export function Avatar({ address, avatarCid, size = 40 }: { address: string; avatarCid?: string; size?: number }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!avatarCid || !isCid(avatarCid) || error) return;
    let cancelled = false;
    loadImage(avatarCid)
      .then(url => { if (!cancelled) setImgUrl(url); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [avatarCid, error]);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt="Avatar"
        className="shrink-0 rounded-full border border-[#202020]/40 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return <Orb address={address} size={size} />;
}

const Icon = ({ d, size = 20, color = "currentColor", weight = 2, className }: { d: string; size?: number; color?: string; weight?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

export const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? "#f4212e" : "none"} stroke={filled ? "none" : "#71767b"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.05 1.32-3.458 3.045C12.727 4.309 12 4.793 12 5.198c-.207-.405-.927-.889-1.542-2.153C9.05 4.32 7.76 3 6 3a5.5 5.5 0 0 0-5.5 5.5c0 2.29 1.51 4.04 3 5.5l4 4 4-4z" />
  </svg>
);
export const ChatIcon = ({ size = 20, className }: { size?: number; className?: string }) => <Icon d="M22 12c0-5-3.542-9-8-9s-8 4-8 9 3.542 9 8 9 8-4 8-9" size={size} className={className} />;
export const RepostIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <Icon d="M7 7h10v3l4-4-4-4v3H3v4h4v3l4 4 4-4v-3h3v-4H7z" size={size} className={className} />
);
export const BookmarkIcon = ({ size = 20, className }: { size?: number; className?: string }) => <Icon d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" size={size} className={className} />;
export const MoreIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
  <Icon d="M12 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2" size={size} color="#71767b" className={className} />
);
export const BackIcon = ({ size = 20, className }: { size?: number; className?: string }) => <Icon d="M15 18l-6-6 6-6" size={size} className={className} />;
export const HomeIcon = ({ size = 20, color = "currentColor", className }: { size?: number; color?: string; className?: string }) => (
  <Icon d="M3 12l9-8 9 8M12 5v14M12 5l-7 7M12 5l7 7" size={size} color={color} className={className} />
);
export const UserIcon = ({ size = 20, className }: { size?: number; className?: string }) => <Icon d="M19 21a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2z" size={size} className={className} />;
export const TickIcon = ({ size = 14, className }: { size?: number; className?: string }) => <Icon d="M5 13l4 4L19 7" size={size} color="#1d9bf0" weight={2.5} className={className} />;
export const ImageIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <Icon d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={size} className={className} />
);

// Text stored on IPFS (post body or bio)
export function IpfsText({ cid, className = "" }: { cid: string; className?: string }) {
  const [t, setT] = useState<string>(isCid(cid) ? "" : cid);
  useEffect(() => {
    if (!isCid(cid)) return setT(cid);
    let on = true;
    loadJson(cid)
      .then((d: any) => on && setT(d.text ?? ""))
      .catch(() => on && setT("Couldn't load this content."));
    return () => {
      on = false;
    };
  }, [cid]);
  return (
    <p className={`whitespace-pre-wrap break-words ${fMain} ${className}`}>{t}</p>
  );
}

// Media image stored on IPFS (post attachment)
export function PostMedia({ cid, className = "", onClick }: { cid: string; className?: string; onClick?: () => void }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cid || !isCid(cid) || error) return;
    let cancelled = false;
    loadImage(cid)
      .then(url => { if (!cancelled) setImgUrl(url); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [cid, error]);

  if (error) {
    return <p className={`${textDim} text-sm mt-2`}>Couldn&apos;t load media.</p>;
  }
  if (!imgUrl) {
    return <div className={`${className} h-48 rounded-xl bg-[#202020]/40 flex items-center justify-center`}>
      <ImageIcon size={32} className="text-[#536471]" />
    </div>;
  }
  return (
    <img
      src={imgUrl}
      alt="Post media"
      className={`rounded-xl object-cover w-full max-h-[500px] cursor-pointer ${className}`}
      style={{ maxWidth: "100%" }}
      onClick={onClick}
    />
  );
}

// X-style follow button
export function FollowButton({ S, address }: { S: SocialState; address: string }) {
  const on = S.following(address);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => S.toggleFollow(address)}
      className={`rounded-full px-3 py-1.5 text-sm font-bold transition-all duration-200 ${
        on
          ? "border border-[#202020] text-[#f7f9f9] hover:bg-[#202020]"
          : `${accentBg} text-[#0a0a0a] hover:bg-[#1a8cd8] ${hovered ? "shadow-[0_0_0_1px_rgba(29,155,240,0.5)]" : ""}`
      }`}
    >
      {on ? "Following" : "Follow"}
    </button>
  );
}

export function PostRow({
  post,
  S,
  onProfile,
  onThread,
  large,
}: {
  post: Post;
  S: SocialState;
  onProfile: (a: string) => void;
  onThread: (id: string) => void;
  large?: boolean;
}) {
  const profile = S.profiles.get(post.author);
  const handle = profile?.handle;
  const avatarCid = profile?.avatarCid;
  const parent = post.replyTo !== "0" ? S.posts.get(post.replyTo) : undefined;
  const parentHandle = parent ? S.profiles.get(parent.author)?.handle : undefined;
  const replyCount = S.replies.get(post.id)?.length ?? 0;
  const liked = S.liked(post.id);

  return (
    <article
      className={`flex gap-3 border-b border-[#202020]/40 px-4 py-3 transition-colors hover:bg-[#161616]/50 ${large ? "py-4" : ""}`}
      onClick={() => onThread(post.id)}
      style={{ cursor: "pointer" }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onProfile(post.author); }}
        aria-label="Open profile"
        className="shrink-0"
      >
        <Avatar address={post.author} avatarCid={avatarCid} size={48} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onProfile(post.author); }}
            className={`${fName} text-[15px] hover:underline`}
          >
            {handle ? `@${handle}` : short(post.author)}
          </button>
          {handle && <span className={fHandle}>· {short(post.author)}</span>}
        </div>
        {parent && !large && (
          <p className={`${textMuted} text-[13px] mt-0.5`}>
            Replying to {parentHandle ? `@${parentHandle}` : "a post"}
          </p>
        )}
        <div role="link" tabIndex={0} className="cursor-pointer outline-none mt-1">
          <IpfsText cid={post.cid} className={`mt-0.5 leading-relaxed ${large ? "text-xl" : "text-[16px]"}`} />
        </div>
        {post.mediaCid && (
          <div className="mt-2.5">
            <PostMedia cid={post.mediaCid} className="cursor-pointer" onClick={() => onThread(post.id)} />
          </div>
        )}
        <div className="mt-2.5 flex items-center gap-3 text-[14px]">
          <button
            onClick={(e) => { e.stopPropagation(); onThread(post.id); }}
            aria-label="Reply"
            className="inline-flex items-center gap-1.5 text-[#536471] hover:text-[#1d9bf0] transition-colors"
          >
            <ChatIcon size={18} /> {replyCount}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); S.toggleLike(post.id); }}
            aria-label={liked ? "Unlike" : "Like"}
            className={`inline-flex items-center gap-1.5 transition-colors duration-200 ${
              liked ? likeRed : "text-[#536471] hover:text-[#1d9bf0]"
            }`}
          >
            <HeartIcon filled={liked} size={20} /> {S.likeCount(post.id)}
          </button>
          <button
            aria-label="Repost"
            className="inline-flex items-center gap-1.5 text-[#536471] hover:text-[#1d9bf0] transition-colors ml-auto"
          >
            <RepostIcon size={18} />
          </button>
          <button
            aria-label="Bookmark"
            className="inline-flex items-center gap-1.5 text-[#536471] hover:text-[#1d9bf0] transition-colors ml-2"
          >
            <BookmarkIcon size={18} />
          </button>
          <MoreIcon />
        </div>
      </div>
    </article>
  );
}

export function Composer({
  S,
  placeholder,
  label,
  onSubmit,
}: {
  S: SocialState;
  placeholder: string;
  label: string;
  onSubmit: (text: string, mediaFile?: File) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const go = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    if (await onSubmit(text.trim(), mediaFile)) {
      setText("");
      setMediaFile(null);
      setMediaPreview(null);
    }
    setBusy(false);
  };
  const canPost = text.trim().length > 0 && !busy;

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  return (
    <div className={`flex gap-3 border-b border-[#202020]/40 px-4 py-3 ${surface}`}>
      {S.me && <Avatar address={S.me} avatarCid={S.profiles.get(S.me)?.avatarCid} size={40} />}
      <div className="flex-1 min-w-0">
        <textarea
          className="w-full resize-none bg-transparent text-[16px] leading-tight outline-none placeholder:text-[#536471]"
          rows={1}
          maxLength={1000}
          placeholder={placeholder}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && canPost) {
              e.preventDefault();
              go();
            }
          }}
        />
        {mediaFile && mediaPreview && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#202020]/50 bg-[#202020]/30 p-2">
            <img src={mediaPreview} alt="Preview" className="rounded-md object-cover" style={{ width: 60, height: 60 }} />
            <span className="text-xs text-[#53647a] truncate max-w-[200px]">{mediaFile.name}</span>
            <button onClick={removeMedia} className="text-[#f4212e] hover:text-[#ff4d4d] text-sm">Remove</button>
          </div>
        )}
        <div className="flex items-end justify-between pt-1">
          <span className={`${textDim} text-[12px]`}>{text.length}/1000</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setMediaFile(file);
                  setMediaPreview(URL.createObjectURL(file));
                };
                input.click();
              }}
              className="text-[#536471] hover:text-[#1d9bf0] p-1.5 rounded hover:bg-[#202020]/50 transition-colors"
              title="Attach image"
            >
              <ImageIcon size={18} />
            </button>
            <button
              onClick={go}
              disabled={!canPost}
              className={`rounded-full px-5 py-1.5 text-sm font-bold transition-all duration-200 ${
                canPost ? accentBg : "bg-[#202020]/50 text-[#71767b]"
              } ${canPost ? "hover:bg-[#1a8cd8] active:scale-95" : "cursor-not-allowed"}`}
            >
              {busy ? "Posting…" : label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSetup({ S }: { S: SocialState }) {
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className={`flex flex-col gap-3 border-b border-[#202020]/40 px-4 py-4 ${surface}`}>
      <h2 className={`${fName} text-2xl tracking-tight`}>Choose your handle</h2>
      <p className={`${textDim} text-sm`}>Your handle is stored on-chain and belongs to your wallet.</p>
      <input
        className={field}
        placeholder="handle"
        maxLength={20}
        value={handle}
        onChange={e => setHandle(e.target.value)}
      />
      <textarea
        className={`${field} resize-none mt-2`}
        rows={2}
        maxLength={160}
        placeholder="Short bio (optional)"
        value={bio}
        onChange={e => setBio(e.target.value)}
      />
      <div className="mt-2">
        <label className="block text-sm text-[#71767b] mb-1">Profile picture (optional)</label>
        <div className="flex items-center gap-3">
          {avatarPreview ? (
            <>
              <img src={avatarPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-[#202020]" />
              <button
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                className="text-xs text-[#f4212e] hover:text-[#ff4d4d] underline"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                };
                input.click();
              }}
              className="text-xs text-[#536471] hover:text-[#1d9bf0] underline"
            >
              Upload image
            </button>
          )}
        </div>
      </div>
      <button
        disabled={busy || handle.length < 3}
        onClick={async () => {
          setBusy(true);
          await S.saveProfile(handle, bio, avatarFile);
          setBusy(false);
        }}
        className={`self-start rounded-full px-6 py-2.5 font-bold transition-all duration-200 ${
          handle.length >= 3 && !busy ? accentBg : "bg-[#202020]/50 text-[#71767b]"
        } ${(handle.length >= 3 && !busy) ? "hover:bg-[#1a8cd8] text-[#0a0a0a]" : "cursor-not-allowed"}`}
      >
        {busy ? "Saving…" : "Create profile"}
      </button>
    </div>
  );
}
